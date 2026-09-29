from .tle_client import TLEClient
from .cara_engine import CARAEngine

class ConjunctionService:
    def __init__(self):
        self.tle_client = TLEClient()
        self.cara_engine = CARAEngine()
        
    def screen(self, catnr1: str, catnr2: str):
        pass
