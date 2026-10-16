"""Real PostgreSQL regression: chatbot greetings must not require Service tables."""
import json,subprocess,time,uuid
from pathlib import Path
root=Path(__file__).resolve().parents[2];name='central-greeting-test-'+uuid.uuid4().hex[:10]
image='postgres@sha256:3162a6ead070474b27289f09eac4c865e75f93847a2d7098f718ee5a721637c4'
def run(*args,**kwargs):return subprocess.run(['docker',*args],capture_output=True,text=True,check=True,**kwargs).stdout
def sql(query):return run('exec','-i',name,'psql','-U','postgres','-d','postgres','-X','-A','-t','-v','ON_ERROR_STOP=1',input=query).strip()
try:
 run('run','-d','--name',name,'--network','none','--tmpfs','/var/lib/postgresql/data','-e','POSTGRES_HOST_AUTH_METHOD=trust',image)
 for _ in range(40):
  if subprocess.run(['docker','exec',name,'pg_isready','-U','postgres'],capture_output=True).returncode==0:break
  time.sleep(1)
 else:raise AssertionError('isolated_postgres_not_ready')
 sql('CREATE TABLE configuration(id BIGSERIAL PRIMARY KEY,key TEXT,value TEXT,deleted BOOLEAN DEFAULT false,domain UUID);')
 query=(root/'DSL/Resql/backoffice/POST/get-greeting-message.sql').read_text()
 assert sql(query)=='|f|message||'
 sql("INSERT INTO configuration(key,value) VALUES ('greeting_message_est','Hello'),('is_greeting_message_active','true'),('greeting_type','service'),('greeting_service_id','fixture-id'),('greeting_service_name','FixtureService');")
 assert sql(query)=='Hello|t|service|fixture-id|FixtureService'
 domain='11111111-1111-4111-8111-111111111111'
 domain_query=(root/'DSL/Resql/backoffice/POST/get-domain-greeting-message.sql').read_text().replace(':domainUUID',"'"+domain+"'")
 assert sql(domain_query)=='|f|message||'
 sql("INSERT INTO configuration(key,value,domain) VALUES ('greeting_message_est','Domain hello','"+domain+"'),('is_greeting_message_active','true','"+domain+"');")
 assert sql(domain_query)=='Domain hello|t|message||'
 assert sql("SELECT to_regclass('services') IS NULL;")=='t'
 print(json.dumps({'status':'PASS','realPostgres':True,'noServiceTableRequired':True,'emptyAndConfiguredGlobalAndDomain':True,'externalNetwork':False}))
finally:subprocess.run(['docker','rm','-f',name],capture_output=True)
