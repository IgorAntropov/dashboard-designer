from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0006_processed_webhooks"
down_revision: str | None = "0005_subscriptions"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "processed_webhooks",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("provider", sa.String(length=32), nullable=False),
        sa.Column("event_key", sa.String(length=200), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_processed_webhooks_event_key",
        "processed_webhooks",
        ["event_key"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_table("processed_webhooks")
