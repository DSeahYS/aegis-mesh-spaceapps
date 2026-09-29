import numpy as np
from scipy.integrate import dblquad

class CARAEngine:
    def __init__(self):
        pass

    def compute_b_plane(self, r_p, v_p, r_s, v_s):
        r_p = np.array(r_p)
        v_p = np.array(v_p)
        r_s = np.array(r_s)
        v_s = np.array(v_s)

        dr = r_s - r_p
        dv = v_s - v_p
        
        v_rel_mag = np.linalg.norm(dv)
        if v_rel_mag < 1e-8:
            return {"xi": np.linalg.norm(dr), "zeta": 0.0, "b_mag": np.linalg.norm(dr)}
            
        eta = dv / v_rel_mag
        
        h = np.cross(r_p, v_p)
        if np.linalg.norm(h) < 1e-6:
            h = r_p
            
        xi = np.cross(h, eta)
        if np.linalg.norm(xi) < 1e-6:
            fallback = np.array([0, 0, 1]) if abs(eta[2]) < 0.9 else np.array([1, 0, 0])
            xi = np.cross(fallback, eta)
            
        xi = xi / np.linalg.norm(xi)
        zeta = np.cross(eta, xi)
        
        b_xi = np.dot(dr, xi)
        b_zeta = np.dot(dr, zeta)
        
        return {
            "xi": float(b_xi),
            "zeta": float(b_zeta),
            "b_mag": float(np.sqrt(b_xi**2 + b_zeta**2))
        }

    def compute_probability(self, b_plane: dict, combined_cov: np.ndarray, hbr_km: float) -> float:
        try:
            det_cov = np.linalg.det(combined_cov)
            if det_cov <= 1e-18 or hbr_km <= 0:
                return 0.0
                
            inv_cov = np.linalg.inv(combined_cov)
            xi = b_plane['xi']
            zeta = b_plane['zeta']
            
            mahal_sq = inv_cov[0,0]*xi**2 + 2*inv_cov[0,1]*xi*zeta + inv_cov[1,1]*zeta**2
            
            sigma_prod = np.sqrt(max(1e-18, det_cov))
            exponent = -0.5 * mahal_sq
            
            if exponent < -50:
                return 0.0
                
            scale = 1 - np.exp(-(hbr_km**2) / (2 * sigma_prod))
            pc = scale * np.exp(exponent)
            
            return float(min(1.0, max(0.0, pc)))
        except Exception:
            return 0.0
