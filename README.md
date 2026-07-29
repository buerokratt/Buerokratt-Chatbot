# Bürokratt's Chat Bot

# Scope

This repo will primarily contain:

1. Architectural and other documentation;
2. Docker Compose file to set up and run Bürokratt's Chat Bot as a fully functional service;

## Dev setup

- Clone [Ruuter](https://github.com/buerokratt/Ruuter)
- Navigate to Ruuter and build the image `docker build -t ruuter .`
- Clone [Resql](https://github.com/buerokratt/Resql)
- Navigate to Resql and build the image `docker build -t resql .`
- Clone [Data Mapper](https://github.com/buerokratt/DataMapper)
- Navigate to Data Mapper and build the image `docker build -t data-mapper .`
- Clone [Cron Manager](https://github.com/buerokratt/CronManager)
- Navigate to Cron Manager and build the image `docker build -t cron-manager .`
- Clone [TIM](https://github.com/buerokratt/TIM)
- Navigate to TIM and build the image `docker build -t tim .`
- Clone [S3-Ferry](https://github.com/buerokratt/S3-Ferry)
- Navigate to S3-Ferry and build the image `docker build -t s3-ferry .`
- Clone [Chat Widget](https://github.com/buerokratt/Chat-Widget)
- build chat widget image `docker build -f Dockerfile.dev -t chat-widget .`
- Clone [Authentication Layer](https://github.com/buerokratt/Authentication-layer)
- build authentication layer image `docker build -f Dockerfile.dev -t authentication-layer .`
- Clone [RASA](https://github.com/buerokratt/Rasa-for-Buerokratt)
- choose dev branch and run `docker build -t rasa .`
- Clone [Anonymizer](https://github.com/buerokratt/Presidio-Anonymizer)
- choose dev branch and run `docker build --platform=linux/amd64 -t anonymizer .`

### Run with local bot - deprecated

- Change `CHATBOT_BOT=http://bot:5005` in constants.ini
- Navigate to current repo and run `docker-compose $(find docker-* | sed -e 's/^/-f /') up -d`

### Run with remote bot - deprecated

- Change `CHATBOT_BOT=http://171.22.247.37:5005` in constants.ini
- Navigate to current repo and run `docker-compose up -d`

### Database setup

- For setting up the database initially, run
  `docker run --platform linux/amd64 --network=bykstack riaee/byk-users-db:liquibase20220615 --url=jdbc:postgresql://users_db:5432/byk --username=byk --password=01234 --changelog-file=./master.yml update`
- Run migrations added in this repository by running the helper script `./migrate.sh`
- When creating new migrations, use the helper `./create-migration.sh name-of-migration` which will create a timestamped file in the correct directory and add the required headers

### Logging in and using GUI

1. Open <http://localhost:3004/et/dev-auth>.
2. Enter `EE30303039914` as login, leave password empty.
3. Click on log in and wait, can take up to a minute.

### Open Search

- To Initialize Open Search run `./deploy-opensearch.sh <URL> <AUTH> <Is Mock Allowed - Default false>`
- To Use Opensearch locally run `./deploy-opensearch.sh http://localhost:9200 admin:admin true`

### Use external components

Currently, Header and Main Navigation used as external components, they are defined as dependency in package.json

```
 "@buerokratt-ria/header": "^0.0.1"
 "@buerokratt-ria/menu": "^0.0.1"
 "@buerokratt-ria/styles": "^0.0.1"
```

### Notes

##### Ruuter Internal Requests

- When running ruuter either on local or in an environment make sure to adjust `- application.internalRequests.allowedIPs=127.0.0.1,{YOUR_IPS}` under ruuter environments

##### S3 Ferry source config key

- `CHATBOT_S3_FERRY_SOURCE_CONFIG_KEY` in `constants.ini` controls the S3 Ferry source storage configuration key used when exporting ended chat history to XLSX.
- The ended chats download flow first creates the XLSX file through Data Mapper, then asks S3 Ferry to copy that generated file from filesystem storage (`sourceStorageType: "FS"`) to S3. This value is passed as S3 Ferry's `sourceConfigKey` for that filesystem source.
- The default value is `default`, which preserves the previous hardcoded behavior. Override it during deployment when the S3 Ferry filesystem source configuration uses a different key.

### Kubernetes deployment

For production deploying on kubernetes use this the variable [`REACT_APP_MENU_JSON`](https://github.com/buerokratt/NoOps/blob/dev/Kubernetes/Modules/Buerokratt-Chatbot/templates/deployment-byk-backoffice-gui.yaml) with the value:

```
"[{\"id\":\"conversations\",\"label\":{\"et\":\"Vestlused\",\"en\":\"Conversations\"},\"path\":\"/chat\",\"children\":[{\"label\":{\"et\":\"Vastamata\",\"en\":\"Unanswered\"},\"path\":\"/unanswered\"},{\"label\":{\"et\":\"Aktiivsed\",\"en\":\"Active\"},\"path\":\"/active\"},{\"label\":{\"et\":\"Ootel\",\"en\":\"Pending\"},\"path\":\"/pending\"},{\"label\":{\"et\":\"Ajalugu\",\"en\":\"History\"},\"path\":\"/history\"}]},{\"id\":\"training\",\"label\":{\"et\":\"Treening\",\"en\":\"Training\"},\"path\":\"/training\",\"children\":[{\"label\":{\"et\":\"Treening\",\"en\":\"Training\"},\"path\":\"/training\",\"children\":[{\"label\":{\"et\":\"Teemad\",\"en\":\"Themes\"},\"path\":\"/training/intents\"},{\"hidden\":true,\"label\":{\"et\":\"Avalikud teemad\",\"en\":\"Public themes\"},\"path\":\"/training/common-intents\"},{\"label\":{\"et\":\"Teemade järeltreenimine\",\"en\":\"Post training themes\"},\"path\":\"/training/intents-followup-training\"},{\"label\":{\"et\":\"Vastused\",\"en\":\"Answers\"},\"path\":\"/training/responses\"},{\"label\":{\"et\":\"Reeglid\",\"en\":\"Rules\"},\"path\":\"/training/rules\"},{\"hidden\":true,\"label\":{\"et\":\"Konfiguratsioon\",\"en\":\"Configuration\"},\"path\":\"/training/configuration\"},{\"label\":{\"et\":\"Vormid\",\"en\":\"Forms\"},\"path\":\"/training/forms\"},{\"label\":{\"et\":\"Mälukohad\",\"en\":\"Slots\"},\"path\":\"/training/slots\"},{\"hidden\":true,\"label\":{\"et\":\"Automatic Teenused\",\"en\":\"Automatic Services\"},\"path\":\"/auto-services\"}]},{\"label\":{\"et\":\"Ajaloolised vestlused\",\"en\":\"Historical conversations\"},\"path\":\"/history\",\"children\":[{\"label\":{\"et\":\"Ajalugu\",\"en\":\"History\"},\"path\":\"/history/history\"},{\"hidden\":true,\"label\":{\"et\":\"Pöördumised\",\"en\":\"Appeals\"},\"path\":\"/history/appeal\"}]},{\"label\":{\"et\":\"Mudelipank ja analüütika\",\"en\":\"Modelbank and analytics\"},\"path\":\"/analytics\",\"children\":[{\"label\":{\"et\":\"Teemade ülevaade\",\"en\":\"Overview of topics\"},\"path\":\"/analytics/overview\"},{\"label\":{\"et\":\"Mudelite võrdlus\",\"en\":\"Comparison of models\"},\"path\":\"/analytics/models\"},{\"hidden\":true,\"label\":{\"et\":\"Testlood\",\"en\":\"testTracks\"},\"path\":\"/analytics/testcases\"}]},{\"label\":{\"et\":\"Treeni uus mudel\",\"en\":\"Train new model\"},\"path\":\"/train-new-model\"}]},{\"id\":\"analytics\",\"label\":{\"et\":\"Analüütika\",\"en\":\"Analytics\"},\"path\":\"/analytics\",\"children\":[{\"label\":{\"et\":\"Ülevaade\",\"en\":\"Overview\"},\"path\":\"/overview\"},{\"label\":{\"et\":\"Vestlused\",\"en\":\"Chats\"},\"path\":\"/chats\"},{\"label\":{\"et\":\"Tagasiside\",\"en\":\"Feedback\"},\"path\":\"/feedback\"},{\"label\":{\"et\":\"Avaandmed\",\"en\":\"Reports\"},\"path\":\"/reports\"}]},{\"id\":\"services\",\"hidden\":true,\"label\":{\"et\":\"Teenused\",\"en\":\"Services\"},\"path\":\"/services\",\"children\":[{\"label\":{\"et\":\"Ülevaade\",\"en\":\"Overview\"},\"path\":\"/overview\"},{\"label\":{\"et\":\"Uus teenus\",\"en\":\"New Service\"},\"path\":\"/newService\"},{\"label\":{\"et\":\"Automatic Teenused\",\"en\":\"Automatic Services\"},\"path\":\"/auto-services\"},{\"label\":{\"et\":\"Probleemsed teenused\",\"en\":\"Faulty Services\"},\"path\":\"/faultyServices\"}]},{\"id\":\"settings\",\"label\":{\"et\":\"Haldus\",\"en\":\"Administration\"},\"path\":\"/settings\",\"children\":[{\"label\":{\"et\":\"Kasutajad\",\"en\":\"Users\"},\"path\":\"/users\"},{\"label\":{\"et\":\"Vestlusbot\",\"en\":\"Chatbot\"},\"path\":\"/chatbot\",\"children\":[{\"label\":{\"et\":\"Seaded\",\"en\":\"Settings\"},\"path\":\"/chatbot/settings\"},{\"label\":{\"et\":\"Tervitussõnum\",\"en\":\"Welcome message\"},\"path\":\"/chatbot/welcome-message\"},{\"label\":{\"et\":\"Välimus ja käitumine\",\"en\":\"Appearance and behavior\"},\"path\":\"/chatbot/appearance\"},{\"label\":{\"et\":\"Erakorralised teated\",\"en\":\"Emergency notices\"},\"path\":\"/chatbot/emergency-notices\"}]},{\"label\":{\"et\":\"Asutuse tööaeg\",\"en\":\"Office opening hours\"},\"path\":\"/working-time\"},{\"label\":{\"et\":\"Sessiooni pikkus\",\"en\":\"Session length\"},\"path\":\"/session-length\"}]},{\"id\":\"monitoring\",\"hidden\":true,\"label\":{\"et\":\"Seire\",\"en\":\"Monitoring\"},\"path\":\"/monitoring\",\"children\":[{\"label\":{\"et\":\"Aktiivaeg\",\"en\":\"Working hours\"},\"path\":\"/uptime\"}]}]"
```

like this:

```
- name: REACT_APP_MENU_JSON
  value: "[{\"id\":\"conversations\",\"label\":{\"et\":\"Vestlused\",\"en\":\"Conversations\"},\"path\":\"/chat\",\"children\":[{\"label\":{\"et\":\"Vastamata\",\"en\":\"Unanswered\"},\"path\":\"/unanswered\"},{\"label\":{\"et\":\"Aktiivsed\",\"en\":\"Active\"},\"path\":\"/active\"},{\"label\":{\"et\":\"Ootel\",\"en\":\"Pending\"},\"path\":\"/pending\"},{\"label\":{\"et\":\"Ajalugu\",\"en\":\"History\"},\"path\":\"/history\"}]},{\"id\":\"training\",\"label\":{\"et\":\"Treening\",\"en\":\"Training\"},\"path\":\"/training\",\"children\":[{\"label\":{\"et\":\"Treening\",\"en\":\"Training\"},\"path\":\"/training\",\"children\":[{\"label\":{\"et\":\"Teemad\",\"en\":\"Themes\"},\"path\":\"/training/intents\"},{\"hidden\":true,\"label\":{\"et\":\"Avalikud teemad\",\"en\":\"Public themes\"},\"path\":\"/training/common-intents\"},{\"label\":{\"et\":\"Teemade järeltreenimine\",\"en\":\"Post training themes\"},\"path\":\"/training/intents-followup-training\"},{\"label\":{\"et\":\"Vastused\",\"en\":\"Answers\"},\"path\":\"/training/responses\"},{\"label\":{\"et\":\"Reeglid\",\"en\":\"Rules\"},\"path\":\"/training/rules\"},{\"hidden\":true,\"label\":{\"et\":\"Konfiguratsioon\",\"en\":\"Configuration\"},\"path\":\"/training/configuration\"},{\"label\":{\"et\":\"Vormid\",\"en\":\"Forms\"},\"path\":\"/training/forms\"},{\"label\":{\"et\":\"Mälukohad\",\"en\":\"Slots\"},\"path\":\"/training/slots\"},{\"hidden\":true,\"label\":{\"et\":\"Automatic Teenused\",\"en\":\"Automatic Services\"},\"path\":\"/auto-services\"}]},{\"label\":{\"et\":\"Ajaloolised vestlused\",\"en\":\"Historical conversations\"},\"path\":\"/history\",\"children\":[{\"label\":{\"et\":\"Ajalugu\",\"en\":\"History\"},\"path\":\"/history/history\"},{\"hidden\":true,\"label\":{\"et\":\"Pöördumised\",\"en\":\"Appeals\"},\"path\":\"/history/appeal\"}]},{\"label\":{\"et\":\"Mudelipank ja analüütika\",\"en\":\"Modelbank and analytics\"},\"path\":\"/analytics\",\"children\":[{\"label\":{\"et\":\"Teemade ülevaade\",\"en\":\"Overview of topics\"},\"path\":\"/analytics/overview\"},{\"label\":{\"et\":\"Mudelite võrdlus\",\"en\":\"Comparison of models\"},\"path\":\"/analytics/models\"},{\"hidden\":true,\"label\":{\"et\":\"Testlood\",\"en\":\"testTracks\"},\"path\":\"/analytics/testcases\"}]},{\"label\":{\"et\":\"Treeni uus mudel\",\"en\":\"Train new model\"},\"path\":\"/train-new-model\"}]},{\"id\":\"analytics\",\"label\":{\"et\":\"Analüütika\",\"en\":\"Analytics\"},\"path\":\"/analytics\",\"children\":[{\"label\":{\"et\":\"Ülevaade\",\"en\":\"Overview\"},\"path\":\"/overview\"},{\"label\":{\"et\":\"Vestlused\",\"en\":\"Chats\"},\"path\":\"/chats\"},{\"label\":{\"et\":\"Tagasiside\",\"en\":\"Feedback\"},\"path\":\"/feedback\"},{\"label\":{\"et\":\"Avaandmed\",\"en\":\"Reports\"},\"path\":\"/reports\"}]},{\"id\":\"services\",\"hidden\":true,\"label\":{\"et\":\"Teenused\",\"en\":\"Services\"},\"path\":\"/services\",\"children\":[{\"label\":{\"et\":\"Ülevaade\",\"en\":\"Overview\"},\"path\":\"/overview\"},{\"label\":{\"et\":\"Uus teenus\",\"en\":\"New Service\"},\"path\":\"/newService\"},{\"label\":{\"et\":\"Automatic Teenused\",\"en\":\"Automatic Services\"},\"path\":\"/auto-services\"},{\"label\":{\"et\":\"Probleemsed teenused\",\"en\":\"Faulty Services\"},\"path\":\"/faultyServices\"}]},{\"id\":\"settings\",\"label\":{\"et\":\"Haldus\",\"en\":\"Administration\"},\"path\":\"/settings\",\"children\":[{\"label\":{\"et\":\"Kasutajad\",\"en\":\"Users\"},\"path\":\"/users\"},{\"label\":{\"et\":\"Vestlusbot\",\"en\":\"Chatbot\"},\"path\":\"/chatbot\",\"children\":[{\"label\":{\"et\":\"Seaded\",\"en\":\"Settings\"},\"path\":\"/chatbot/settings\"},{\"label\":{\"et\":\"Tervitussõnum\",\"en\":\"Welcome message\"},\"path\":\"/chatbot/welcome-message\"},{\"label\":{\"et\":\"Välimus ja käitumine\",\"en\":\"Appearance and behavior\"},\"path\":\"/chatbot/appearance\"},{\"label\":{\"et\":\"Erakorralised teated\",\"en\":\"Emergency notices\"},\"path\":\"/chatbot/emergency-notices\"}]},{\"label\":{\"et\":\"Asutuse tööaeg\",\"en\":\"Office opening hours\"},\"path\":\"/working-time\"},{\"label\":{\"et\":\"Sessiooni pikkus\",\"en\":\"Session length\"},\"path\":\"/session-length\"}]},{\"id\":\"monitoring\",\"hidden\":true,\"label\":{\"et\":\"Seire\",\"en\":\"Monitoring\"},\"path\":\"/monitoring\",\"children\":[{\"label\":{\"et\":\"Aktiivaeg\",\"en\":\"Working hours\"},\"path\":\"/uptime\"}]}]"
```

### Chat generation cron endpoints

The private Ruuter routes under `POST /backoffice/cron-tasks/chat-generation/*` are used by CronManager's `chat_generation.sh` script to create test and demo chat data without running real end-user, TARA, or customer-support-agent authentication flows.

These endpoints are intended only for automated chat generation. They accept generated chat and message metadata and are protected with an `x-ruuter-nonce`.

---
### Ended chat history export (download)

The ended chat history download flow retrieves all chats matching the selected filters in a single ReSQL request. It calls `get-cs-all-ended-chats` with `isPaginationEnabled: false`; in this mode, `page` and `page_size` remain required ReSQL parameters but do not limit the returned rows. The regular chat history table continues to call the same query with pagination enabled.

The export then retrieves messages for all selected chats and passes the chat and message data to Data Mapper for XLSX generation. This avoids the previous Ruuter pagination loop, which could not process more than ten pages because of Ruuter's step-recursion limit.

Unpaginated chat and message responses can exceed Ruuter's default 256 KiB HTTP response buffer. `CHAT_HISTORY_EXPORT_RESPONSE_SIZE_LIMIT_KB` in `constants.ini` controls the per-response limit for both ReSQL calls in the download flow. The value is specified in KiB and defaults to `20480` (20 MiB).

> **Important:** A value that is too low causes the export to fail with HTTP 500, while an excessively high value allows Ruuter to buffer larger responses and can increase memory pressure. After changing this value, restart `ruuter-private` for the new configuration to take effect.

The appropriate limit is deployment-specific and may require future tuning. Export size depends on each client's chat volume, the number and length of messages, selected filters, and general usage patterns. Keeping the value in `constants.ini` allows it to be adjusted for a client's data profile without changing the download DSL.

The limit applies separately to the chat response and the message response; it is not a combined export-size limit. If either data-fetch request fails, the download endpoint returns HTTP 500 with `Failed to fetch chat history export data`.
