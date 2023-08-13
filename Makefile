.PHONY: build-events-service
build-events-service:
	docker buildx build --platform linux/amd64 -t meetmap:events-service -f apps/events-service/Dockerfile . && docker tag meetmap:events-service 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-events-service:latest

.PHONY: push-image-events-service
push-image-events-service:
	docker push 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-events-service:latest


.PHONY: build-location-service
build-location-service:
	docker buildx build --platform linux/amd64 -t meetmap:location-service -f apps/location-service/Dockerfile . && docker tag meetmap:location-service 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-location-service:latest

.PHONY: push-image-location-service
push-image-location-service:
	docker push 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-location-service:latest


.PHONY: build-auth-service
build-auth-service:
	docker buildx build --platform linux/amd64 -t meetmap:auth-service -f apps/auth-service/Dockerfile . && docker tag meetmap:auth-service 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-auth-service:latest

.PHONY: push-image-auth-service
push-image-auth-service:
	docker push 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-auth-service:latest




.PHONY: build-users-service
build-users-service:
	docker buildx build --platform linux/amd64 -t meetmap:users-service -f apps/users-service/Dockerfile . && docker tag meetmap:users-service 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-users-service:latest

.PHONY: push-image-users-service
push-image-users-service:
	docker push 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-users-service:latest

.PHONY: build-assets-service
build-assets-service:
	docker buildx build --platform linux/amd64 -t meetmap:assets-service -f apps/assets-service/Dockerfile . && docker tag meetmap:assets-service 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-assets-service:latest

.PHONY: push-image-assets-service
push-image-assets-service:
	docker push 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-assets-service:latest


.PHONY: build-jobs-service
build-jobs-service:
	docker buildx build --platform linux/amd64 -t meetmap:jobs-service -f apps/jobs-service/Dockerfile . && docker tag meetmap:jobs-service 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-jobs-service:latest

.PHONY: push-image-jobs-service
push-image-jobs-service:
	docker push 970180171170.dkr.ecr.eu-west-1.amazonaws.com/meetmap-jobs-service:latest


.PHONY: build-microservices
build-all-microservices: build-events-service build-location-service build-users-service

.PHONY: run-all-microservices
run-all-microservices: run-events-service run-users-service run-location-service

.PHONY: run-events-service
run-events-service:
	docker run -d -p 3000:3000 --env-file .env meetmap:events-service

.PHONY: run-users-service
run-users-service:
	docker run -d -p 3001:3001 --env-file .env meetmap:users-service

.PHONY: run-location-service
run-location-service:
	docker run -d -p 3002:3002 --env-file .env meetmap:location-service

.PHONY: deploy-events-service
deploy-events-service:
	make registry-login && \
	make build-events-service && \
	make push-image-events-service && \
	aws ecs update-service --profile meetmap --region eu-west-1 --cluster main-prod-cluster --service events-service --force-new-deployment --no-cli-pager

.PHONY: deploy-users-service
deploy-users-service:
	make registry-login && \
	make build-users-service && \
	make push-image-users-service && \
	aws ecs update-service --profile meetmap --region eu-west-1 --cluster main-prod-cluster --service users-service --force-new-deployment --no-cli-pager

.PHONY: deploy-location-service
deploy-location-service:
	make registry-login && \
	make build-location-service && \
	make push-image-location-service && \
	aws ecs update-service --profile meetmap --region eu-west-1 --cluster main-prod-cluster --service location-service --force-new-deployment --no-cli-pager

.PHONY: deploy-auth-service
deploy-auth-service:
	make registry-login && \
	make build-auth-service && \
	make push-image-auth-service && \
	aws ecs update-service --profile meetmap --region eu-west-1 --cluster main-prod-cluster --service auth-service --force-new-deployment --no-cli-pager

.PHONY: deploy-assets-service
deploy-assets-service:
	make registry-login && \
	make build-assets-service && \
	make push-image-assets-service && \
	aws ecs update-service --profile meetmap --region eu-west-1 --cluster main-prod-cluster --service assets-service --force-new-deployment --no-cli-pager	

.PHONY: deploy-jobs-service
deploy-jobs-service:
	make registry-login && \
	make build-jobs-service && \
	make push-image-jobs-service && \
	aws ecs update-service --profile meetmap --region eu-west-1 --cluster main-prod-cluster --service jobs-service --force-new-deployment --no-cli-pager	


.PHONY: deploy-all
make deploy-all:
	make deploy-jobs-service && make deploy-users-service && make deploy-location-service && make deploy-auth-service && make deploy-events-service && make deploy-assets-service

.PHONY: registry-login
registry-login:
	aws ecr get-login-password --region eu-west-1 --profile meetmap | docker login --username AWS --password-stdin 970180171170.dkr.ecr.eu-west-1.amazonaws.com


.PHONY: local-dev
local-dev:
	docker-compose -f docker-compose.dev.yaml up 
