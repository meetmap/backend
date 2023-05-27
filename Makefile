.PHONY: build-events-fetcher
build-events-fetcher:
	docker buildx build --platform linux/amd64 -t meetmap:events-fetcher -f apps/events-fetcher/Dockerfile . && docker tag meetmap:events-fetcher 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-events-fetcher:latest

.PHONY: push-image-events-fetcher
push-image-events-fetcher:
	docker push 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-events-fetcher:latest


.PHONY: build-location-service
build-location-service:
	docker buildx build --platform linux/amd64 -t meetmap:location-service -f apps/location-service/Dockerfile . && docker tag meetmap:location-service 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-location-service:latest

.PHONY: push-image-location-service
push-image-location-service:
	docker push 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-location-service:latest


.PHONY: build-main-app
build-main-app:
	docker buildx build --platform linux/amd64 -t meetmap:main-app -f apps/main-app/Dockerfile . && docker tag meetmap:main-app 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-main-app:latest

.PHONY: push-image-main-app
push-image-main-app:
	docker push 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-main-app:latest


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
	make registry-login && \
	make build-events-fetcher && \
	make push-image-events-fetcher && \
	aws ecs update-service --profile meetmap --region eu-west-1 --cluster main-prod-cluster --service events-fetcher --force-new-deployment

.PHONY: deploy-main-app
deploy-main-app:
	make registry-login && \
	make build-main-app && \
	make push-image-main-app && \
	aws ecs update-service --profile meetmap --region eu-west-1 --cluster main-prod-cluster --service main-app --force-new-deployment

.PHONY: deploy-location-service
deploy-location-service:
	make registry-login && \
	make build-location-service && \
	make push-image-location-service && \
	aws ecs update-service --profile meetmap --region eu-west-1 --cluster main-prod-cluster --service location-service --force-new-deployment


.PHONY: registry-login
registry-login:
	aws ecr get-login-password --region eu-west-1 --profile meetmap | docker login --username AWS --password-stdin 970180171170.dkr.ecr.eu-west-1.amazonaws.com



