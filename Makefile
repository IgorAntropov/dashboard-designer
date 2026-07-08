.PHONY: dev down logs ps

dev:
	./scripts/dev.sh

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps
