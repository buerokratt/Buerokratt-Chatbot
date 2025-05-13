import requests

def test_list_establishments(resql_url):
    response = requests.get(resql_url + "/org/list_establishments")
    assert response.status_code == 200
    assert response.json() == [{'names': ['some name', 'establishement']}]
