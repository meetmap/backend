.PHONY: build-events-fetcher
build-events-fetcher:
	docker buildx build --platform linux/amd64 -t meetmap:events-fetcher -f apps/events-fetcher/Dockerfile . && docker tag meetmap:events-fetcher registry.heroku.com/meetmap-events-fetcher/web && docker push registry.heroku.com/meetmap-events-fetcher/web

.PHONY: push-image-events-fetcher
push-image-events-fetcher:
	docker tag meetmap:events-fetcher registry.heroku.com/meetmap-events-fetcher/web && docker push registry.heroku.com/meetmap-events-fetcher/web


.PHONY: build-location-service
build-location-service:
	docker buildx build --platform linux/amd64 -t meetmap:location-service -f apps/location-service/Dockerfile .

.PHONY: push-image-location-service
push-image-location-service:
	docker tag meetmap:location-service registry.heroku.com/meetmap-location-service/web && docker push registry.heroku.com/meetmap-location-service/web


.PHONY: build-main-app
build-main-app:
	docker buildx build --platform linux/amd64 -t meetmap:main-app -f apps/main-app/Dockerfile .

.PHONY: push-image-main-app
push-image-main-app:
	docker tag meetmap:main-app registry.heroku.com/meetmap-main-app/web && docker push registry.heroku.com/meetmap-main-app/web


.PHONY: build-microservices
build-all-microservices: build-events-fetcher build-location-service build-main-app

.PHONY: run-all-microservices
run-all-microservices: run-events-fetcher run-main-app run-location-service

.PHONY: run-events-fetcher
run-events-fetcher:
	docker run -d -p 3000:3000 --env-file .env meetmap:events-fetcher

.PHONY: run-main-app
run-main-app:
	docker run -d -p 3001:3001 --env-file .env meetmap:main-app

.PHONY: run-location-service
run-location-service:
	docker run -d -p 3002:3002 --env-file .env meetmap:location-service

.PHONY: deploy-events-fetcher
deploy-events-fetcher:
	make build-events-fetcher && make push-image-events-fetcher && heroku container:release web -a meetmap-events-fetcher

.PHONY: deploy-main-app
deploy-main-app:
	make build-main-app && make push-image-main-app && heroku container:release web -a meetmap-main-app

.PHONY: deploy-location-service
deploy-location-service:
	make build-location-service && make push-image-location-service && heroku container:release web -a meetmap-location-service

.PHONY: heroku-login
heroku-login:
	heroku login && heroku container:login


