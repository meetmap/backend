TO deploy app:


heroku auth:token

docker login --username=d4v1ds0n.p@gmail.com --password=${token} registry.heroku.com

docker build -t registry.heroku.com/app_name/web
docker push registry.heroku.com/app_name/web