import requests
from sgp4.api import Satrec
import numpy as np

class TLEClient:
    def __init__(self):
        self.base_url = "https://celestrak.org/NORAD/elements/gp.php"
        
    def query(self, params: dict):
        try:
            resp = requests.get(self.base_url, params=params, timeout=10)
            if resp.status_code == 200:
                lines = resp.text.strip().split('\n')
                tles = []
                for i in range(0, len(lines), 3):
                    if i + 2 < len(lines):
                        tles.append({
                            "name": lines[i].strip(),
                            "line1": lines[i+1].strip(),
                            "line2": lines[i+2].strip()
                        })
                return tles
        except Exception as e:
            print(f"TLE Fetch Error: {e}")
        return []
        
    def propagate(self, tle_line1: str, tle_line2: str, jd: float, fr: float):
        try:
            satellite = Satrec.twoline2rv(tle_line1, tle_line2)
            e, r, v = satellite.sgp4(jd, fr)
            if e == 0:
                return np.array(r), np.array(v)
        except Exception:
            pass
        return None, None
