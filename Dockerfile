FROM python:3-alpine

ADD catalogue /opt/catalogue

WORKDIR /opt/catalogue

ADD requirements.txt .

RUN python -m pip install -r requirements.txt

ENTRYPOINT [ "python", "runner.py" ]
