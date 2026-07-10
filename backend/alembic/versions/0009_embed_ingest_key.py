from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0009_embed_ingest_key"
down_revision: str | None = "0008_embed_events"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "embed_tokens",
        sa.Column(
            "ingest_key",
            sa.String(length=64),
            nullable=False,
            server_default="",
        ),
    )


def downgrade() -> None:
    op.drop_column("embed_tokens", "ingest_key")
