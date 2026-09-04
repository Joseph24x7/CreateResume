export const CATEGORY_TREE = {
  programming_languages: { name: 'Programming Languages', icon: 'code', skills: [] },
  frontend: { name: 'Frontend Frameworks & Libraries', icon: 'layout', skills: [] },
  backend: { name: 'Backend Frameworks', icon: 'server', skills: [] },
  cloud: { name: 'Cloud & Infrastructure', icon: 'cloud', skills: [] },
  containers: { name: 'Containers & Orchestration', icon: 'box', skills: [] },
  databases: { name: 'Databases', icon: 'database', skills: [] },
  messaging: { name: 'Messaging & Streaming', icon: 'message-circle', skills: [] },
  devops: { name: 'DevOps & CI/CD', icon: 'git-merge', skills: [] },
  ai_ml: { name: 'AI/ML & Data Science', icon: 'cpu', skills: [] },
  data_engineering: { name: 'Data Engineering', icon: 'hard-drive', skills: [] },
  architecture: { name: 'Architecture & Patterns', icon: 'layers', skills: [] },
  security: { name: 'Security & Compliance', icon: 'shield', skills: [] },
  testing: { name: 'Testing', icon: 'check-circle', skills: [] },
  tools: { name: 'Tools & Platforms', icon: 'tool', skills: [] },
  methodologies: { name: 'Methodologies', icon: 'briefcase', skills: [] },
  domain_specific: { name: 'Domain-Specific', icon: 'globe', skills: [] },
};

const rawSkills = [
  // 1. Programming Languages
  { id: 'java', name: 'Java', aliases: ['java', 'jre', 'jdk', 'j2ee'], category: 'programming_languages' },
  { id: 'python', name: 'Python', aliases: ['python', 'python3', 'py'], category: 'programming_languages' },
  { id: 'javascript', name: 'JavaScript', aliases: ['javascript', 'js', 'es6', 'vanilla js'], category: 'programming_languages' },
  { id: 'typescript', name: 'TypeScript', aliases: ['typescript', 'ts'], category: 'programming_languages', parent: 'javascript' },
  { id: 'go', name: 'Go', aliases: ['go', 'golang'], category: 'programming_languages' },
  { id: 'rust', name: 'Rust', aliases: ['rust', 'rustlang'], category: 'programming_languages' },
  { id: 'c', name: 'C', aliases: ['c', 'clang'], category: 'programming_languages' },
  { id: 'c_plus_plus', name: 'C++', aliases: ['c++', 'cpp', 'cplusplus'], category: 'programming_languages' },
  { id: 'c_sharp', name: 'C#', aliases: ['c#', 'csharp', '.net', 'c sharp'], category: 'programming_languages' },
  { id: 'kotlin', name: 'Kotlin', aliases: ['kotlin', 'kt'], category: 'programming_languages' },
  { id: 'scala', name: 'Scala', aliases: ['scala'], category: 'programming_languages' },
  { id: 'ruby', name: 'Ruby', aliases: ['ruby', 'rb'], category: 'programming_languages' },
  { id: 'php', name: 'PHP', aliases: ['php', 'php7', 'php8'], category: 'programming_languages' },
  { id: 'swift', name: 'Swift', aliases: ['swift'], category: 'programming_languages' },
  { id: 'dart', name: 'Dart', aliases: ['dart'], category: 'programming_languages' },
  { id: 'r', name: 'R', aliases: ['r', 'rstats'], category: 'programming_languages' },
  { id: 'matlab', name: 'MATLAB', aliases: ['matlab'], category: 'programming_languages' },
  { id: 'perl', name: 'Perl', aliases: ['perl', 'pl'], category: 'programming_languages' },
  { id: 'lua', name: 'Lua', aliases: ['lua'], category: 'programming_languages' },
  { id: 'elixir', name: 'Elixir', aliases: ['elixir'], category: 'programming_languages' },
  { id: 'haskell', name: 'Haskell', aliases: ['haskell', 'hs'], category: 'programming_languages' },
  { id: 'clojure', name: 'Clojure', aliases: ['clojure', 'clj'], category: 'programming_languages' },
  { id: 'groovy', name: 'Groovy', aliases: ['groovy'], category: 'programming_languages' },
  { id: 'objective_c', name: 'Objective-C', aliases: ['objective-c', 'objc', 'objective c'], category: 'programming_languages' },
  { id: 'assembly', name: 'Assembly', aliases: ['assembly', 'asm'], category: 'programming_languages' },
  { id: 'cobol', name: 'COBOL', aliases: ['cobol'], category: 'programming_languages' },
  { id: 'fortran', name: 'Fortran', aliases: ['fortran'], category: 'programming_languages' },
  { id: 'julia', name: 'Julia', aliases: ['julia'], category: 'programming_languages' },
  { id: 'shell', name: 'Shell', aliases: ['shell', 'sh', 'scripting'], category: 'programming_languages' },
  { id: 'bash', name: 'Bash', aliases: ['bash', 'bash scripting'], category: 'programming_languages', parent: 'shell' },
  { id: 'powershell', name: 'PowerShell', aliases: ['powershell', 'ps1'], category: 'programming_languages', parent: 'shell' },

  // 2. Frontend
  { id: 'react', name: 'React', aliases: ['react', 'react.js', 'reactjs'], category: 'frontend' },
  { id: 'angular', name: 'Angular', aliases: ['angular', 'angular.js', 'angularjs', 'angular 2+'], category: 'frontend' },
  { id: 'vue', name: 'Vue', aliases: ['vue', 'vue.js', 'vuejs', 'vue3'], category: 'frontend' },
  { id: 'svelte', name: 'Svelte', aliases: ['svelte', 'sveltejs'], category: 'frontend' },
  { id: 'nextjs', name: 'Next.js', aliases: ['next.js', 'nextjs', 'next'], category: 'frontend', parent: 'react' },
  { id: 'nuxtjs', name: 'Nuxt.js', aliases: ['nuxt.js', 'nuxtjs', 'nuxt'], category: 'frontend', parent: 'vue' },
  { id: 'gatsby', name: 'Gatsby', aliases: ['gatsby', 'gatsbyjs'], category: 'frontend', parent: 'react' },
  { id: 'remix', name: 'Remix', aliases: ['remix', 'remix run'], category: 'frontend', parent: 'react' },
  { id: 'astro', name: 'Astro', aliases: ['astro', 'astro build'], category: 'frontend' },
  { id: 'solidjs', name: 'SolidJS', aliases: ['solidjs', 'solid.js', 'solid'], category: 'frontend' },
  { id: 'jquery', name: 'jQuery', aliases: ['jquery', 'jq'], category: 'frontend' },
  { id: 'ember', name: 'Ember', aliases: ['ember', 'ember.js'], category: 'frontend' },
  { id: 'backbone', name: 'Backbone', aliases: ['backbone', 'backbone.js'], category: 'frontend' },
  { id: 'react_native', name: 'React Native', aliases: ['react native', 'rn'], category: 'frontend', parent: 'react' },
  { id: 'flutter', name: 'Flutter', aliases: ['flutter'], category: 'frontend' },
  { id: 'ionic', name: 'Ionic', aliases: ['ionic', 'ionic framework'], category: 'frontend' },
  { id: 'html', name: 'HTML', aliases: ['html', 'html5'], category: 'frontend' },
  { id: 'css', name: 'CSS', aliases: ['css', 'css3'], category: 'frontend' },
  { id: 'sass_scss', name: 'SASS/SCSS', aliases: ['sass', 'scss'], category: 'frontend', parent: 'css' },
  { id: 'less', name: 'Less', aliases: ['less'], category: 'frontend', parent: 'css' },
  { id: 'tailwind_css', name: 'Tailwind CSS', aliases: ['tailwind css', 'tailwind', 'tailwindcss'], category: 'frontend', parent: 'css' },
  { id: 'bootstrap', name: 'Bootstrap', aliases: ['bootstrap'], category: 'frontend', parent: 'css' },
  { id: 'material_ui', name: 'Material UI', aliases: ['material ui', 'mui', 'material-ui'], category: 'frontend', parent: 'react' },
  { id: 'chakra_ui', name: 'Chakra UI', aliases: ['chakra ui', 'chakra'], category: 'frontend', parent: 'react' },
  { id: 'storybook', name: 'Storybook', aliases: ['storybook'], category: 'frontend' },

  // 3. Backend
  { id: 'spring', name: 'Spring', aliases: ['spring', 'spring framework'], category: 'backend' },
  { id: 'spring_boot', name: 'Spring Boot', aliases: ['spring boot', 'springboot'], category: 'backend', parent: 'spring' },
  { id: 'spring_cloud', name: 'Spring Cloud', aliases: ['spring cloud'], category: 'backend', parent: 'spring' },
  { id: 'spring_security', name: 'Spring Security', aliases: ['spring security'], category: 'backend', parent: 'spring' },
  { id: 'spring_data', name: 'Spring Data', aliases: ['spring data'], category: 'backend', parent: 'spring' },
  { id: 'express', name: 'Express', aliases: ['express', 'express.js', 'expressjs'], category: 'backend' },
  { id: 'nestjs', name: 'NestJS', aliases: ['nestjs', 'nest.js', 'nest'], category: 'backend' },
  { id: 'django', name: 'Django', aliases: ['django'], category: 'backend' },
  { id: 'flask', name: 'Flask', aliases: ['flask'], category: 'backend' },
  { id: 'fastapi', name: 'FastAPI', aliases: ['fastapi', 'fast api'], category: 'backend' },
  { id: 'rails', name: 'Ruby on Rails', aliases: ['rails', 'ruby on rails', 'ror'], category: 'backend' },
  { id: 'laravel', name: 'Laravel', aliases: ['laravel'], category: 'backend' },
  { id: 'symfony', name: 'Symfony', aliases: ['symfony'], category: 'backend' },
  { id: 'asp_net', name: 'ASP.NET', aliases: ['asp.net', 'aspnet'], category: 'backend' },
  { id: 'dotnet_core', name: '.NET Core', aliases: ['.net core', 'dotnet core', 'dotnet'], category: 'backend' },
  { id: 'gin', name: 'Gin', aliases: ['gin', 'gin-gonic'], category: 'backend' },
  { id: 'fiber', name: 'Fiber', aliases: ['fiber', 'gofiber'], category: 'backend' },
  { id: 'echo', name: 'Echo', aliases: ['echo', 'go echo'], category: 'backend' },
  { id: 'actix', name: 'Actix', aliases: ['actix', 'actix-web'], category: 'backend' },
  { id: 'rocket', name: 'Rocket', aliases: ['rocket', 'rocket.rs'], category: 'backend' },
  { id: 'phoenix', name: 'Phoenix', aliases: ['phoenix', 'phoenix framework'], category: 'backend' },
  { id: 'play_framework', name: 'Play Framework', aliases: ['play framework', 'play'], category: 'backend' },
  { id: 'ktor', name: 'Ktor', aliases: ['ktor'], category: 'backend' },
  { id: 'micronaut', name: 'Micronaut', aliases: ['micronaut'], category: 'backend' },
  { id: 'quarkus', name: 'Quarkus', aliases: ['quarkus'], category: 'backend' },

  // 4. Cloud
  { id: 'aws', name: 'AWS', aliases: ['aws', 'amazon web services'], category: 'cloud' },
  { id: 'azure', name: 'Azure', aliases: ['azure', 'microsoft azure'], category: 'cloud' },
  { id: 'gcp', name: 'GCP', aliases: ['gcp', 'google cloud', 'google cloud platform'], category: 'cloud' },
  { id: 's3', name: 'S3', aliases: ['s3', 'amazon s3', 'aws s3'], category: 'cloud', parent: 'aws' },
  { id: 'ec2', name: 'EC2', aliases: ['ec2', 'amazon ec2', 'aws ec2'], category: 'cloud', parent: 'aws' },
  { id: 'lambda', name: 'Lambda', aliases: ['lambda', 'aws lambda'], category: 'cloud', parent: 'aws' },
  { id: 'ecs_cloud', name: 'ECS', aliases: ['ecs', 'aws ecs', 'elastic container service'], category: 'cloud', parent: 'aws' },
  { id: 'eks_cloud', name: 'EKS', aliases: ['eks', 'aws eks', 'elastic kubernetes service'], category: 'cloud', parent: 'aws' },
  { id: 'rds', name: 'RDS', aliases: ['rds', 'aws rds', 'amazon rds'], category: 'cloud', parent: 'aws' },
  { id: 'sqs_cloud', name: 'SQS', aliases: ['sqs', 'aws sqs'], category: 'cloud', parent: 'aws' },
  { id: 'sns_cloud', name: 'SNS', aliases: ['sns', 'aws sns'], category: 'cloud', parent: 'aws' },
  { id: 'cloudformation', name: 'CloudFormation', aliases: ['cloudformation', 'aws cloudformation'], category: 'cloud', parent: 'aws' },
  { id: 'cdk', name: 'CDK', aliases: ['cdk', 'aws cdk'], category: 'cloud', parent: 'aws' },
  { id: 'api_gateway', name: 'API Gateway', aliases: ['api gateway', 'aws api gateway'], category: 'cloud', parent: 'aws' },
  { id: 'route53', name: 'Route53', aliases: ['route53', 'aws route53', 'route 53'], category: 'cloud', parent: 'aws' },
  { id: 'cloudfront', name: 'CloudFront', aliases: ['cloudfront', 'aws cloudfront'], category: 'cloud', parent: 'aws' },
  { id: 'azure_devops_cloud', name: 'Azure DevOps', aliases: ['azure devops', 'ado'], category: 'cloud', parent: 'azure' },
  { id: 'azure_functions', name: 'Azure Functions', aliases: ['azure functions'], category: 'cloud', parent: 'azure' },
  { id: 'gke_cloud', name: 'GKE', aliases: ['gke', 'google kubernetes engine'], category: 'cloud', parent: 'gcp' },
  { id: 'cloud_run', name: 'Cloud Run', aliases: ['cloud run', 'google cloud run'], category: 'cloud', parent: 'gcp' },
  { id: 'bigquery_cloud', name: 'BigQuery', aliases: ['bigquery', 'google bigquery', 'bq'], category: 'cloud', parent: 'gcp' },
  { id: 'heroku', name: 'Heroku', aliases: ['heroku'], category: 'cloud' },
  { id: 'digitalocean', name: 'DigitalOcean', aliases: ['digitalocean', 'digital ocean', 'do'], category: 'cloud' },
  { id: 'linode', name: 'Linode', aliases: ['linode', 'akamai linode'], category: 'cloud' },
  { id: 'vercel', name: 'Vercel', aliases: ['vercel'], category: 'cloud' },
  { id: 'netlify', name: 'Netlify', aliases: ['netlify'], category: 'cloud' },
  { id: 'cloudflare', name: 'Cloudflare', aliases: ['cloudflare'], category: 'cloud' },

  // 5. Containers
  { id: 'docker', name: 'Docker', aliases: ['docker', 'dockerized'], category: 'containers' },
  { id: 'kubernetes', name: 'Kubernetes', aliases: ['kubernetes', 'k8s'], category: 'containers' },
  { id: 'docker_compose', name: 'Docker Compose', aliases: ['docker compose', 'docker-compose'], category: 'containers', parent: 'docker' },
  { id: 'podman', name: 'Podman', aliases: ['podman'], category: 'containers' },
  { id: 'helm', name: 'Helm', aliases: ['helm', 'helm charts'], category: 'containers', parent: 'kubernetes' },
  { id: 'istio', name: 'Istio', aliases: ['istio', 'istio service mesh'], category: 'containers' },
  { id: 'envoy', name: 'Envoy', aliases: ['envoy', 'envoy proxy'], category: 'containers' },
  { id: 'openshift', name: 'OpenShift', aliases: ['openshift', 'red hat openshift'], category: 'containers', parent: 'kubernetes' },
  { id: 'rancher', name: 'Rancher', aliases: ['rancher'], category: 'containers', parent: 'kubernetes' },
  { id: 'nomad', name: 'Nomad', aliases: ['nomad', 'hashicorp nomad'], category: 'containers' },
  { id: 'ecs', name: 'ECS', aliases: ['ecs', 'amazon ecs'], category: 'containers' },
  { id: 'eks', name: 'EKS', aliases: ['eks', 'amazon eks'], category: 'containers', parent: 'kubernetes' },
  { id: 'gke', name: 'GKE', aliases: ['gke', 'google kubernetes engine'], category: 'containers', parent: 'kubernetes' },
  { id: 'aks', name: 'AKS', aliases: ['aks', 'azure kubernetes service'], category: 'containers', parent: 'kubernetes' },
  { id: 'fargate', name: 'Fargate', aliases: ['fargate', 'aws fargate'], category: 'containers' },

  // 6. Databases
  { id: 'postgresql', name: 'PostgreSQL', aliases: ['postgresql', 'postgres', 'psql'], category: 'databases' },
  { id: 'mysql', name: 'MySQL', aliases: ['mysql'], category: 'databases' },
  { id: 'mariadb', name: 'MariaDB', aliases: ['mariadb'], category: 'databases' },
  { id: 'oracle', name: 'Oracle', aliases: ['oracle', 'oracle db'], category: 'databases' },
  { id: 'sql_server', name: 'SQL Server', aliases: ['sql server', 'mssql', 'ms sql'], category: 'databases' },
  { id: 'sqlite', name: 'SQLite', aliases: ['sqlite', 'sqlite3'], category: 'databases' },
  { id: 'mongodb', name: 'MongoDB', aliases: ['mongodb', 'mongo'], category: 'databases' },
  { id: 'cassandra', name: 'Cassandra', aliases: ['cassandra', 'apache cassandra'], category: 'databases' },
  { id: 'dynamodb', name: 'DynamoDB', aliases: ['dynamodb', 'aws dynamodb'], category: 'databases' },
  { id: 'redis', name: 'Redis', aliases: ['redis'], category: 'databases' },
  { id: 'memcached', name: 'Memcached', aliases: ['memcached'], category: 'databases' },
  { id: 'elasticsearch', name: 'Elasticsearch', aliases: ['elasticsearch', 'elastic search', 'es'], category: 'databases' },
  { id: 'solr', name: 'Solr', aliases: ['solr', 'apache solr'], category: 'databases' },
  { id: 'neo4j', name: 'Neo4j', aliases: ['neo4j'], category: 'databases' },
  { id: 'couchdb', name: 'CouchDB', aliases: ['couchdb', 'apache couchdb'], category: 'databases' },
  { id: 'influxdb', name: 'InfluxDB', aliases: ['influxdb'], category: 'databases' },
  { id: 'timescaledb', name: 'TimescaleDB', aliases: ['timescaledb', 'timescale'], category: 'databases', parent: 'postgresql' },
  { id: 'cockroachdb', name: 'CockroachDB', aliases: ['cockroachdb', 'cockroach'], category: 'databases' },
  { id: 'snowflake', name: 'Snowflake', aliases: ['snowflake'], category: 'databases' },
  { id: 'bigquery', name: 'BigQuery', aliases: ['bigquery', 'bq'], category: 'databases' },
  { id: 'redshift', name: 'Redshift', aliases: ['redshift', 'aws redshift'], category: 'databases' },
  { id: 'databricks', name: 'Databricks', aliases: ['databricks'], category: 'databases' },
  { id: 'hbase', name: 'HBase', aliases: ['hbase', 'apache hbase'], category: 'databases' },
  { id: 'couchbase', name: 'Couchbase', aliases: ['couchbase'], category: 'databases' },
  { id: 'arangodb', name: 'ArangoDB', aliases: ['arangodb'], category: 'databases' },
  { id: 'rethinkdb', name: 'RethinkDB', aliases: ['rethinkdb'], category: 'databases' },
  { id: 'firebase_firestore', name: 'Firebase Firestore', aliases: ['firestore', 'firebase firestore', 'firebase db'], category: 'databases' },
  { id: 'supabase', name: 'Supabase', aliases: ['supabase'], category: 'databases' },

  // 7. Messaging
  { id: 'kafka', name: 'Kafka', aliases: ['kafka', 'apache kafka'], category: 'messaging' },
  { id: 'rabbitmq', name: 'RabbitMQ', aliases: ['rabbitmq', 'rabbit mq'], category: 'messaging' },
  { id: 'activemq', name: 'ActiveMQ', aliases: ['activemq', 'apache activemq'], category: 'messaging' },
  { id: 'sqs', name: 'SQS', aliases: ['sqs', 'aws sqs', 'amazon sqs'], category: 'messaging' },
  { id: 'sns', name: 'SNS', aliases: ['sns', 'aws sns', 'amazon sns'], category: 'messaging' },
  { id: 'pulsar', name: 'Pulsar', aliases: ['pulsar', 'apache pulsar'], category: 'messaging' },
  { id: 'nats', name: 'NATS', aliases: ['nats'], category: 'messaging' },
  { id: 'zeromq', name: 'ZeroMQ', aliases: ['zeromq', '0mq', 'zmq'], category: 'messaging' },
  { id: 'kafka_streams', name: 'Kafka Streams', aliases: ['kafka streams'], category: 'messaging', parent: 'kafka' },
  { id: 'flink', name: 'Flink', aliases: ['flink', 'apache flink'], category: 'messaging' },
  { id: 'spark_streaming', name: 'Spark Streaming', aliases: ['spark streaming'], category: 'messaging' },
  { id: 'kinesis', name: 'Kinesis', aliases: ['kinesis', 'aws kinesis'], category: 'messaging' },
  { id: 'eventbridge', name: 'EventBridge', aliases: ['eventbridge', 'aws eventbridge'], category: 'messaging' },
  { id: 'redis_pubsub', name: 'Redis Pub/Sub', aliases: ['redis pubsub', 'redis pub/sub'], category: 'messaging', parent: 'redis' },
  { id: 'mqtt_messaging', name: 'MQTT', aliases: ['mqtt'], category: 'messaging' },

  // 8. DevOps
  { id: 'jenkins', name: 'Jenkins', aliases: ['jenkins'], category: 'devops' },
  { id: 'github_actions', name: 'GitHub Actions', aliases: ['github actions', 'gh actions'], category: 'devops' },
  { id: 'gitlab_ci', name: 'GitLab CI', aliases: ['gitlab ci', 'gitlab ci/cd'], category: 'devops' },
  { id: 'circleci', name: 'CircleCI', aliases: ['circleci', 'circle ci'], category: 'devops' },
  { id: 'travis_ci', name: 'Travis CI', aliases: ['travis ci', 'travis'], category: 'devops' },
  { id: 'argocd', name: 'ArgoCD', aliases: ['argocd', 'argo cd'], category: 'devops' },
  { id: 'spinnaker', name: 'Spinnaker', aliases: ['spinnaker'], category: 'devops' },
  { id: 'bamboo', name: 'Bamboo', aliases: ['bamboo', 'atlassian bamboo'], category: 'devops' },
  { id: 'teamcity', name: 'TeamCity', aliases: ['teamcity'], category: 'devops' },
  { id: 'terraform', name: 'Terraform', aliases: ['terraform', 'tf'], category: 'devops' },
  { id: 'ansible', name: 'Ansible', aliases: ['ansible'], category: 'devops' },
  { id: 'puppet', name: 'Puppet', aliases: ['puppet'], category: 'devops' },
  { id: 'chef', name: 'Chef', aliases: ['chef'], category: 'devops' },
  { id: 'packer', name: 'Packer', aliases: ['packer'], category: 'devops' },
  { id: 'vagrant', name: 'Vagrant', aliases: ['vagrant'], category: 'devops' },
  { id: 'prometheus', name: 'Prometheus', aliases: ['prometheus'], category: 'devops' },
  { id: 'grafana', name: 'Grafana', aliases: ['grafana'], category: 'devops' },
  { id: 'datadog', name: 'Datadog', aliases: ['datadog', 'dd'], category: 'devops' },
  { id: 'splunk', name: 'Splunk', aliases: ['splunk'], category: 'devops' },
  { id: 'elk', name: 'ELK Stack', aliases: ['elk', 'elk stack', 'elasticsearch logstash kibana'], category: 'devops' },
  { id: 'new_relic', name: 'New Relic', aliases: ['new relic', 'newrelic'], category: 'devops' },
  { id: 'pagerduty', name: 'PagerDuty', aliases: ['pagerduty'], category: 'devops' },
  { id: 'nagios', name: 'Nagios', aliases: ['nagios'], category: 'devops' },
  { id: 'zabbix', name: 'Zabbix', aliases: ['zabbix'], category: 'devops' },
  { id: 'sonarqube', name: 'SonarQube', aliases: ['sonarqube', 'sonar'], category: 'devops' },

  // 9. AI/ML
  { id: 'tensorflow', name: 'TensorFlow', aliases: ['tensorflow', 'tf'], category: 'ai_ml' },
  { id: 'pytorch', name: 'PyTorch', aliases: ['pytorch', 'torch'], category: 'ai_ml' },
  { id: 'scikit_learn', name: 'Scikit-learn', aliases: ['scikit-learn', 'scikit learn', 'sklearn'], category: 'ai_ml' },
  { id: 'keras', name: 'Keras', aliases: ['keras'], category: 'ai_ml' },
  { id: 'pandas', name: 'Pandas', aliases: ['pandas'], category: 'ai_ml' },
  { id: 'numpy', name: 'NumPy', aliases: ['numpy'], category: 'ai_ml' },
  { id: 'scipy', name: 'SciPy', aliases: ['scipy'], category: 'ai_ml' },
  { id: 'matplotlib', name: 'Matplotlib', aliases: ['matplotlib'], category: 'ai_ml' },
  { id: 'seaborn', name: 'Seaborn', aliases: ['seaborn'], category: 'ai_ml' },
  { id: 'jupyter', name: 'Jupyter', aliases: ['jupyter', 'jupyter notebook'], category: 'ai_ml' },
  { id: 'nltk', name: 'NLTK', aliases: ['nltk'], category: 'ai_ml' },
  { id: 'spacy', name: 'SpaCy', aliases: ['spacy'], category: 'ai_ml' },
  { id: 'hugging_face', name: 'Hugging Face', aliases: ['hugging face', 'huggingface'], category: 'ai_ml' },
  { id: 'transformers', name: 'Transformers', aliases: ['transformers', 'transformer models'], category: 'ai_ml' },
  { id: 'langchain', name: 'LangChain', aliases: ['langchain'], category: 'ai_ml' },
  { id: 'openai', name: 'OpenAI', aliases: ['openai'], category: 'ai_ml' },
  { id: 'gpt', name: 'GPT', aliases: ['gpt', 'gpt-3', 'gpt-4', 'chatgpt'], category: 'ai_ml' },
  { id: 'bert', name: 'BERT', aliases: ['bert'], category: 'ai_ml' },
  { id: 'llm', name: 'LLM', aliases: ['llm', 'large language model', 'llms'], category: 'ai_ml' },
  { id: 'rag', name: 'RAG', aliases: ['rag', 'retrieval-augmented generation', 'retrieval augmented generation'], category: 'ai_ml' },
  { id: 'computer_vision', name: 'Computer Vision', aliases: ['computer vision', 'cv'], category: 'ai_ml' },
  { id: 'opencv', name: 'OpenCV', aliases: ['opencv'], category: 'ai_ml' },
  { id: 'yolo', name: 'YOLO', aliases: ['yolo'], category: 'ai_ml' },
  { id: 'stable_diffusion', name: 'Stable Diffusion', aliases: ['stable diffusion'], category: 'ai_ml' },
  { id: 'mlflow', name: 'MLflow', aliases: ['mlflow'], category: 'ai_ml' },
  { id: 'kubeflow', name: 'Kubeflow', aliases: ['kubeflow'], category: 'ai_ml' },
  { id: 'sagemaker', name: 'SageMaker', aliases: ['sagemaker', 'aws sagemaker'], category: 'ai_ml' },
  { id: 'vertex_ai', name: 'Vertex AI', aliases: ['vertex ai', 'gcp vertex ai'], category: 'ai_ml' },
  { id: 'automl', name: 'AutoML', aliases: ['automl'], category: 'ai_ml' },
  { id: 'xgboost', name: 'XGBoost', aliases: ['xgboost'], category: 'ai_ml' },
  { id: 'lightgbm', name: 'LightGBM', aliases: ['lightgbm'], category: 'ai_ml' },
  { id: 'catboost', name: 'CatBoost', aliases: ['catboost'], category: 'ai_ml' },

  // 10. Data Engineering
  { id: 'spark', name: 'Spark', aliases: ['spark', 'apache spark'], category: 'data_engineering' },
  { id: 'hadoop', name: 'Hadoop', aliases: ['hadoop', 'apache hadoop'], category: 'data_engineering' },
  { id: 'hive', name: 'Hive', aliases: ['hive', 'apache hive'], category: 'data_engineering' },
  { id: 'airflow', name: 'Airflow', aliases: ['airflow', 'apache airflow'], category: 'data_engineering' },
  { id: 'dbt', name: 'dbt', aliases: ['dbt', 'data build tool'], category: 'data_engineering' },
  { id: 'kafka_data', name: 'Kafka', aliases: ['kafka'], category: 'data_engineering' },
  { id: 'flink_data', name: 'Flink', aliases: ['flink'], category: 'data_engineering' },
  { id: 'beam', name: 'Beam', aliases: ['beam', 'apache beam'], category: 'data_engineering' },
  { id: 'presto', name: 'Presto', aliases: ['presto', 'prestodb'], category: 'data_engineering' },
  { id: 'trino', name: 'Trino', aliases: ['trino'], category: 'data_engineering' },
  { id: 'iceberg', name: 'Iceberg', aliases: ['iceberg', 'apache iceberg'], category: 'data_engineering' },
  { id: 'delta_lake', name: 'Delta Lake', aliases: ['delta lake'], category: 'data_engineering' },
  { id: 'parquet', name: 'Parquet', aliases: ['parquet', 'apache parquet'], category: 'data_engineering' },
  { id: 'avro', name: 'Avro', aliases: ['avro', 'apache avro'], category: 'data_engineering' },
  { id: 'etl', name: 'ETL', aliases: ['etl', 'extract transform load'], category: 'data_engineering' },
  { id: 'elt', name: 'ELT', aliases: ['elt', 'extract load transform'], category: 'data_engineering' },
  { id: 'data_warehouse', name: 'Data Warehouse', aliases: ['data warehouse', 'data warehousing', 'dwh'], category: 'data_engineering' },
  { id: 'data_lake', name: 'Data Lake', aliases: ['data lake'], category: 'data_engineering' },
  { id: 'data_pipeline', name: 'Data Pipeline', aliases: ['data pipeline', 'data pipelines'], category: 'data_engineering' },
  { id: 'dagster', name: 'Dagster', aliases: ['dagster'], category: 'data_engineering' },

  // 11. Architecture
  { id: 'microservices', name: 'Microservices', aliases: ['microservices', 'microservice architecture', 'micro-services'], category: 'architecture' },
  { id: 'monolith', name: 'Monolith', aliases: ['monolith', 'monolithic architecture'], category: 'architecture' },
  { id: 'event_driven', name: 'Event-Driven', aliases: ['event-driven', 'event driven', 'event driven architecture', 'eda'], category: 'architecture' },
  { id: 'cqrs', name: 'CQRS', aliases: ['cqrs', 'command query responsibility segregation'], category: 'architecture' },
  { id: 'saga', name: 'Saga Pattern', aliases: ['saga', 'saga pattern'], category: 'architecture' },
  { id: 'ddd', name: 'Domain-Driven Design (DDD)', aliases: ['ddd', 'domain driven design', 'domain-driven design'], category: 'architecture' },
  { id: 'rest', name: 'REST', aliases: ['rest', 'restful', 'rest api'], category: 'architecture' },
  { id: 'graphql', name: 'GraphQL', aliases: ['graphql', 'gql'], category: 'architecture' },
  { id: 'grpc', name: 'gRPC', aliases: ['grpc'], category: 'architecture' },
  { id: 'websockets', name: 'WebSockets', aliases: ['websockets', 'websocket'], category: 'architecture' },
  { id: 'serverless', name: 'Serverless', aliases: ['serverless', 'serverless architecture'], category: 'architecture' },
  { id: 'soa', name: 'SOA', aliases: ['soa', 'service oriented architecture', 'service-oriented architecture'], category: 'architecture' },
  { id: 'mvc', name: 'MVC', aliases: ['mvc', 'model view controller', 'model-view-controller'], category: 'architecture' },
  { id: 'mvvm', name: 'MVVM', aliases: ['mvvm', 'model view viewmodel'], category: 'architecture' },
  { id: 'clean_architecture', name: 'Clean Architecture', aliases: ['clean architecture'], category: 'architecture' },
  { id: 'hexagonal', name: 'Hexagonal Architecture', aliases: ['hexagonal', 'hexagonal architecture', 'ports and adapters'], category: 'architecture' },
  { id: 'event_sourcing', name: 'Event Sourcing', aliases: ['event sourcing'], category: 'architecture' },
  { id: 'api_gateway_arch', name: 'API Gateway', aliases: ['api gateway pattern'], category: 'architecture' },
  { id: 'service_mesh', name: 'Service Mesh', aliases: ['service mesh'], category: 'architecture' },
  { id: 'circuit_breaker', name: 'Circuit Breaker', aliases: ['circuit breaker', 'circuit breaker pattern'], category: 'architecture' },

  // 12. Security
  { id: 'oauth', name: 'OAuth', aliases: ['oauth'], category: 'security' },
  { id: 'oauth2', name: 'OAuth2', aliases: ['oauth2', 'oauth 2.0'], category: 'security' },
  { id: 'jwt', name: 'JWT', aliases: ['jwt', 'json web token', 'json web tokens'], category: 'security' },
  { id: 'saml', name: 'SAML', aliases: ['saml'], category: 'security' },
  { id: 'oidc', name: 'OIDC', aliases: ['oidc', 'openid connect'], category: 'security' },
  { id: 'ssl_tls', name: 'SSL/TLS', aliases: ['ssl', 'tls', 'ssl/tls'], category: 'security' },
  { id: 'https', name: 'HTTPS', aliases: ['https'], category: 'security' },
  { id: 'iam', name: 'IAM', aliases: ['iam', 'identity and access management'], category: 'security' },
  { id: 'vault', name: 'Vault', aliases: ['vault', 'hashicorp vault'], category: 'security' },
  { id: 'keycloak', name: 'Keycloak', aliases: ['keycloak'], category: 'security' },
  { id: 'auth0', name: 'Auth0', aliases: ['auth0'], category: 'security' },
  { id: 'owasp', name: 'OWASP', aliases: ['owasp'], category: 'security' },
  { id: 'pci_dss', name: 'PCI DSS', aliases: ['pci dss', 'pci-dss', 'pci compliance'], category: 'security' },
  { id: 'hipaa', name: 'HIPAA', aliases: ['hipaa', 'hipaa compliance'], category: 'security' },
  { id: 'soc2', name: 'SOC2', aliases: ['soc2', 'soc 2'], category: 'security' },
  { id: 'gdpr', name: 'GDPR', aliases: ['gdpr'], category: 'security' },
  { id: 'sox', name: 'SOX', aliases: ['sox', 'sarbanes-oxley'], category: 'security' },
  { id: 'encryption', name: 'Encryption', aliases: ['encryption', 'cryptography'], category: 'security' },
  { id: 'pki', name: 'PKI', aliases: ['pki', 'public key infrastructure'], category: 'security' },
  { id: 'zero_trust', name: 'Zero Trust', aliases: ['zero trust', 'zero trust architecture'], category: 'security' },

  // 13. Testing
  { id: 'junit', name: 'JUnit', aliases: ['junit', 'junit4', 'junit5'], category: 'testing' },
  { id: 'jest', name: 'Jest', aliases: ['jest', 'jestjs'], category: 'testing' },
  { id: 'mocha', name: 'Mocha', aliases: ['mocha'], category: 'testing' },
  { id: 'chai', name: 'Chai', aliases: ['chai'], category: 'testing' },
  { id: 'pytest', name: 'Pytest', aliases: ['pytest', 'py.test'], category: 'testing' },
  { id: 'selenium', name: 'Selenium', aliases: ['selenium', 'selenium webdriver'], category: 'testing' },
  { id: 'cypress', name: 'Cypress', aliases: ['cypress', 'cypress.io'], category: 'testing' },
  { id: 'playwright', name: 'Playwright', aliases: ['playwright'], category: 'testing' },
  { id: 'testng', name: 'TestNG', aliases: ['testng'], category: 'testing' },
  { id: 'mockito', name: 'Mockito', aliases: ['mockito'], category: 'testing' },
  { id: 'jmeter', name: 'JMeter', aliases: ['jmeter', 'apache jmeter'], category: 'testing' },
  { id: 'gatling', name: 'Gatling', aliases: ['gatling'], category: 'testing' },
  { id: 'locust', name: 'Locust', aliases: ['locust'], category: 'testing' },
  { id: 'k6', name: 'K6', aliases: ['k6'], category: 'testing' },
  { id: 'cucumber', name: 'Cucumber', aliases: ['cucumber'], category: 'testing' },
  { id: 'robot_framework', name: 'Robot Framework', aliases: ['robot framework', 'robotframework'], category: 'testing' },
  { id: 'postman_testing', name: 'Postman', aliases: ['postman'], category: 'testing' },
  { id: 'restassured', name: 'RestAssured', aliases: ['restassured', 'rest-assured'], category: 'testing' },
  { id: 'tdd', name: 'TDD', aliases: ['tdd', 'test driven development', 'test-driven development'], category: 'testing' },
  { id: 'bdd', name: 'BDD', aliases: ['bdd', 'behavior driven development', 'behavior-driven development'], category: 'testing' },
  { id: 'unit_testing', name: 'Unit Testing', aliases: ['unit testing', 'unit tests'], category: 'testing' },
  { id: 'integration_testing', name: 'Integration Testing', aliases: ['integration testing', 'integration tests'], category: 'testing' },
  { id: 'e2e_testing', name: 'E2E Testing', aliases: ['e2e testing', 'end to end testing', 'end-to-end testing'], category: 'testing' },
  { id: 'load_testing', name: 'Load Testing', aliases: ['load testing'], category: 'testing' },
  { id: 'performance_testing', name: 'Performance Testing', aliases: ['performance testing'], category: 'testing' },

  // 14. Tools
  { id: 'git', name: 'Git', aliases: ['git'], category: 'tools' },
  { id: 'github', name: 'GitHub', aliases: ['github'], category: 'tools' },
  { id: 'gitlab', name: 'GitLab', aliases: ['gitlab'], category: 'tools' },
  { id: 'bitbucket', name: 'Bitbucket', aliases: ['bitbucket'], category: 'tools' },
  { id: 'jira', name: 'Jira', aliases: ['jira', 'atlassian jira'], category: 'tools' },
  { id: 'confluence', name: 'Confluence', aliases: ['confluence'], category: 'tools' },
  { id: 'slack', name: 'Slack', aliases: ['slack'], category: 'tools' },
  { id: 'vs_code', name: 'VS Code', aliases: ['vs code', 'vscode', 'visual studio code'], category: 'tools' },
  { id: 'intellij', name: 'IntelliJ IDEA', aliases: ['intellij', 'intellij idea', 'idea'], category: 'tools' },
  { id: 'eclipse', name: 'Eclipse', aliases: ['eclipse'], category: 'tools' },
  { id: 'postman_tool', name: 'Postman', aliases: ['postman'], category: 'tools' },
  { id: 'swagger', name: 'Swagger', aliases: ['swagger'], category: 'tools' },
  { id: 'openapi', name: 'OpenAPI', aliases: ['openapi', 'open api'], category: 'tools' },
  { id: 'figma', name: 'Figma', aliases: ['figma'], category: 'tools' },
  { id: 'sketch', name: 'Sketch', aliases: ['sketch'], category: 'tools' },
  { id: 'notion', name: 'Notion', aliases: ['notion'], category: 'tools' },
  { id: 'linear', name: 'Linear', aliases: ['linear'], category: 'tools' },
  { id: 'asana', name: 'Asana', aliases: ['asana'], category: 'tools' },
  { id: 'trello', name: 'Trello', aliases: ['trello'], category: 'tools' },

  // 15. Methodologies
  { id: 'agile', name: 'Agile', aliases: ['agile', 'agile methodology'], category: 'methodologies' },
  { id: 'scrum', name: 'Scrum', aliases: ['scrum'], category: 'methodologies' },
  { id: 'kanban', name: 'Kanban', aliases: ['kanban'], category: 'methodologies' },
  { id: 'safe', name: 'SAFe', aliases: ['safe', 'scaled agile framework'], category: 'methodologies' },
  { id: 'waterfall', name: 'Waterfall', aliases: ['waterfall'], category: 'methodologies' },
  { id: 'lean', name: 'Lean', aliases: ['lean', 'lean methodology'], category: 'methodologies' },
  { id: 'xp', name: 'XP', aliases: ['xp', 'extreme programming'], category: 'methodologies' },
  { id: 'devops_meth', name: 'DevOps', aliases: ['devops'], category: 'methodologies' },
  { id: 'sre', name: 'SRE', aliases: ['sre', 'site reliability engineering'], category: 'methodologies' },
  { id: 'ci_cd', name: 'CI/CD', aliases: ['ci/cd', 'ci cd', 'continuous integration continuous deployment', 'continuous integration continuous delivery'], category: 'methodologies' },
  { id: 'gitops', name: 'GitOps', aliases: ['gitops'], category: 'methodologies' },

  // 16. Domain-Specific
  { id: 'iso8583', name: 'ISO8583', aliases: ['iso8583', 'iso 8583'], category: 'domain_specific' },
  { id: 'swift', name: 'SWIFT', aliases: ['swift messages', 'swift network'], category: 'domain_specific' },
  { id: 'fix_protocol', name: 'FIX Protocol', aliases: ['fix protocol', 'fix api'], category: 'domain_specific' },
  { id: 'emv', name: 'EMV', aliases: ['emv'], category: 'domain_specific' },
  { id: 'dicom', name: 'DICOM', aliases: ['dicom'], category: 'domain_specific' },
  { id: 'hl7', name: 'HL7', aliases: ['hl7'], category: 'domain_specific' },
  { id: 'fhir', name: 'FHIR', aliases: ['fhir', 'hl7 fhir'], category: 'domain_specific' },
  { id: 'aml', name: 'AML', aliases: ['aml', 'anti-money laundering', 'anti money laundering'], category: 'domain_specific' },
  { id: 'kyc', name: 'KYC', aliases: ['kyc', 'know your customer'], category: 'domain_specific' },
  { id: 'basel_iii', name: 'Basel III', aliases: ['basel iii', 'basel 3'], category: 'domain_specific' },
  { id: 'ifrs', name: 'IFRS', aliases: ['ifrs'], category: 'domain_specific' },
  { id: 'gaap', name: 'GAAP', aliases: ['gaap'], category: 'domain_specific' },
  { id: 'ach', name: 'ACH', aliases: ['ach', 'automated clearing house'], category: 'domain_specific' },
  { id: 'nacha', name: 'NACHA', aliases: ['nacha'], category: 'domain_specific' },
  { id: 'sepa', name: 'SEPA', aliases: ['sepa'], category: 'domain_specific' },
  { id: 'blockchain', name: 'Blockchain', aliases: ['blockchain', 'block chain'], category: 'domain_specific' },
  { id: 'ethereum', name: 'Ethereum', aliases: ['ethereum', 'eth'], category: 'domain_specific' },
  { id: 'solidity', name: 'Solidity', aliases: ['solidity'], category: 'domain_specific' },
  { id: 'smart_contracts', name: 'Smart Contracts', aliases: ['smart contracts', 'smart contract'], category: 'domain_specific' },
  { id: 'nft', name: 'NFT', aliases: ['nft', 'nfts', 'non-fungible token'], category: 'domain_specific' },
  { id: 'defi', name: 'DeFi', aliases: ['defi', 'decentralized finance'], category: 'domain_specific' },
  { id: 'iot', name: 'IoT', aliases: ['iot', 'internet of things'], category: 'domain_specific' },
  { id: 'mqtt_domain', name: 'MQTT', aliases: ['mqtt protocol'], category: 'domain_specific' },
  { id: 'edge_computing', name: 'Edge Computing', aliases: ['edge computing', 'edge'], category: 'domain_specific' },
  { id: 'five_g', name: '5G', aliases: ['5g', '5g networks'], category: 'domain_specific' },
  { id: 'robotics', name: 'Robotics', aliases: ['robotics'], category: 'domain_specific' }
];

export const SKILL_ONTOLOGY = {};

// Build the ontology and tree
rawSkills.forEach(skill => {
  const defaultDemand = Math.floor(Math.random() * 40) + 60; // 60-100
  SKILL_ONTOLOGY[skill.id] = {
    id: skill.id,
    name: skill.name,
    aliases: skill.aliases,
    parent: skill.parent || null,
    category: skill.category,
    subcategory: skill.category, 
    children: [],
    related: [],
    demandScore: defaultDemand,
    seniorityWeight: 0.5 + (Math.random() * 0.5) 
  };
});

// Second pass to link children and populate tree
Object.values(SKILL_ONTOLOGY).forEach(skill => {
  if (skill.parent && SKILL_ONTOLOGY[skill.parent]) {
    SKILL_ONTOLOGY[skill.parent].children.push(skill.id);
  }
  if (CATEGORY_TREE[skill.category]) {
    CATEGORY_TREE[skill.category].skills.push(skill.id);
  }
});

const INFERENCE_PATTERNS = [
  { pattern: /event[- ]?driven\s*(architect|pipeline|system)/i, skills: ['kafka', 'event_driven'] },
  { pattern: /message\s*(queue|broker|bus)/i, skills: ['rabbitmq', 'kafka'] },
  { pattern: /container(ized|isation|ization)/i, skills: ['docker'] },
  { pattern: /orchestrat(ed|ion)/i, skills: ['kubernetes'] },
  { pattern: /infrastructure\s*as\s*code/i, skills: ['terraform'] },
  { pattern: /continuous\s*(integration|delivery|deployment)/i, skills: ['ci_cd'] },
  { pattern: /object\s*relational\s*map/i, skills: ['hibernate', 'jpa'] },
  { pattern: /real[- ]?time\s*(data|stream|processing|analytics)/i, skills: ['kafka', 'flink', 'spark_streaming'] },
  { pattern: /distributed\s*(system|computing|transaction)/i, skills: ['microservices', 'kafka'] },
  { pattern: /search\s*engine/i, skills: ['elasticsearch'] },
  { pattern: /in[- ]?memory\s*(cache|store|data)/i, skills: ['redis', 'memcached'] },
  { pattern: /nosql|document\s*store|document\s*database/i, skills: ['mongodb'] },
  { pattern: /graph\s*database/i, skills: ['neo4j'] },
  { pattern: /time[- ]?series/i, skills: ['influxdb', 'timescaledb'] },
  { pattern: /serverless\s*(function|compute|architecture)/i, skills: ['lambda', 'serverless'] },
  { pattern: /machine\s*learning|deep\s*learning|neural\s*network/i, skills: ['machine_learning', 'deep_learning'] },
  { pattern: /natural\s*language\s*processing/i, skills: ['nlp', 'spacy', 'nltk'] },
  { pattern: /large\s*language\s*model/i, skills: ['llm', 'gpt', 'transformers'] },
  { pattern: /retrieval[- ]?augmented/i, skills: ['rag', 'langchain'] },
  { pattern: /single\s*page\s*app/i, skills: ['spa', 'react'] },
  { pattern: /server[- ]?side\s*render/i, skills: ['ssr', 'nextjs'] },
  { pattern: /payment\s*(gateway|processing|system)/i, skills: ['iso8583', 'pci_dss'] },
  { pattern: /agile\s*(methodology|environment|development)/i, skills: ['agile'] },
  { pattern: /relational\s*database/i, skills: ['postgresql', 'mysql'] },
  { pattern: /version\s*control/i, skills: ['git'] },
  { pattern: /cloud\s*(native|infrastructure|platform)/i, skills: ['aws', 'azure', 'gcp'] },
  { pattern: /api\s*(development|design)/i, skills: ['rest', 'graphql'] }
];

export function findSkill(token) {
  if (!token) return null;
  const lowerToken = token.toLowerCase().trim();
  
  if (SKILL_ONTOLOGY[lowerToken]) return SKILL_ONTOLOGY[lowerToken];
  
  for (const skill of Object.values(SKILL_ONTOLOGY)) {
    if (skill.aliases.includes(lowerToken) || skill.name.toLowerCase() === lowerToken) {
      return skill;
    }
  }
  
  // Partial match fallback
  for (const skill of Object.values(SKILL_ONTOLOGY)) {
    if (lowerToken.length > 3 && (skill.name.toLowerCase().includes(lowerToken) || skill.aliases.some(a => a.includes(lowerToken)))) {
      return skill;
    }
  }
  
  return null;
}

export function findSkillsByTokens(tokens) {
  const result = new Map();
  for (const token of tokens) {
    const skill = findSkill(token);
    if (skill) {
      if (result.has(skill.id)) {
        result.get(skill.id).mentions += 1;
      } else {
        result.set(skill.id, { skill, mentions: 1 });
      }
    }
  }
  return result;
}

export function getRelatedSkills(skillId) {
  const skill = SKILL_ONTOLOGY[skillId];
  if (!skill) return [];
  
  const related = [...skill.related];
  if (skill.parent) related.push(skill.parent);
  related.push(...skill.children);
  
  return related.map(id => SKILL_ONTOLOGY[id]).filter(Boolean);
}

export function inferSkillsFromContext(text) {
  const inferred = new Set();
  if (!text) return inferred;
  
  for (const { pattern, skills } of INFERENCE_PATTERNS) {
    if (pattern.test(text)) {
      skills.forEach(s => inferred.add(s));
    }
  }
  return inferred;
}

export function getSkillCategory(skillId) {
  const skill = SKILL_ONTOLOGY[skillId];
  return skill ? skill.category : 'unknown';
}

export function calculateDemandScore(matchedSkillIds) {
  if (!matchedSkillIds || matchedSkillIds.length === 0) return 0;
  
  const total = matchedSkillIds.reduce((sum, id) => {
    const skill = SKILL_ONTOLOGY[id];
    return sum + (skill ? skill.demandScore : 0);
  }, 0);
  
  return Math.min(100, Math.round(total / matchedSkillIds.length));
}

export function getMatchedAndMissingSkills(resumeTokens, jdTokens) {
  const resumeStr = Array.isArray(resumeTokens) ? resumeTokens.join(' ') : resumeTokens;
  const jdStr = Array.isArray(jdTokens) ? jdTokens.join(' ') : jdTokens;
  
  const resumeSkills = findSkillsByTokens(Array.isArray(resumeTokens) ? resumeTokens : []);
  const jdSkills = findSkillsByTokens(Array.isArray(jdTokens) ? jdTokens : []);
  
  const inferredResume = inferSkillsFromContext(resumeStr);
  const inferredJd = inferSkillsFromContext(jdStr);
  
  inferredResume.forEach(id => {
    if (SKILL_ONTOLOGY[id] && !resumeSkills.has(id)) {
      resumeSkills.set(id, { skill: SKILL_ONTOLOGY[id], mentions: 1 });
    }
  });
  
  inferredJd.forEach(id => {
    if (SKILL_ONTOLOGY[id] && !jdSkills.has(id)) {
      jdSkills.set(id, { skill: SKILL_ONTOLOGY[id], mentions: 1 });
    }
  });

  const matched = [];
  const missing = [];
  const categories = {};

  for (const [id, jdData] of jdSkills.entries()) {
    const categoryKey = jdData.skill.category;
    if (!categories[categoryKey]) {
      categories[categoryKey] = {
        name: CATEGORY_TREE[categoryKey]?.name || categoryKey,
        matched: [],
        missing: [],
        score: 0
      };
    }

    if (resumeSkills.has(id)) {
      matched.push(jdData.skill);
      categories[categoryKey].matched.push(jdData.skill);
    } else {
      // Check related as fallback (partial match logic could go here)
      const related = getRelatedSkills(id);
      const hasRelated = related.some(r => resumeSkills.has(r.id));
      if (hasRelated) {
         // Treating as partial match, still let's consider it missing for strictness or matched. We'll add to missing but flag it.
         missing.push({ ...jdData.skill, partialMatch: true });
         categories[categoryKey].missing.push({ ...jdData.skill, partialMatch: true });
      } else {
         missing.push(jdData.skill);
         categories[categoryKey].missing.push(jdData.skill);
      }
    }
  }

  // Calculate scores per category
  for (const cat of Object.values(categories)) {
    const total = cat.matched.length + cat.missing.length;
    cat.score = total > 0 ? Math.round((cat.matched.length / total) * 100) : 0;
  }

  return { matched, missing, categories };
}
