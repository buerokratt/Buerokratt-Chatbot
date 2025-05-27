import pytest
import os


@pytest.fixture
def resql_url():
    return os.environ['RESQL_URL']


@pytest.fixture
def resql_training_url():
    return os.environ['RESQL_TRAINING_URL']
