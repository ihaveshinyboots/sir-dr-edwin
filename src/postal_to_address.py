import requests
import json

postal = [760674,762507,760813,760115,760701,760131,760260,760838,760398,768893,760162,760436,760461,760765,760107,750513,750105,751351,750463,753588,751364]

for x in postal:
    url = f"https://www.onemap.gov.sg/api/common/elastic/search?searchVal={x}&returnGeom=Y&getAddrDetails=Y&pageNum=1"
    response = requests.get(url)
    data = response.json()
    
    if data['found'] > 0:
        result = data['results'][0]
        address = result['ADDRESS']
        longitude = result['LONGITUDE']
        latitude = result['LATITUDE']
        print(f"{x}|{address}|{longitude}|{latitude}")
    else:
        print(f"{x}|No results found")