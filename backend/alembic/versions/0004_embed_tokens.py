from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0004_embed_tokens"
down_revision: str | None = "0003_dashboards"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "embed_tokens",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "dashboard_id",
            sa.Uuid(),
            sa.ForeignKey("dashboards.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token", sa.String(length=64), nullable=False),
        sa.Column(
            "allowed_domains",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.false()),
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
    op.create_index("ix_embed_tokens_dashboard_id", "embed_tokens", ["dashboard_id"])
    op.create_index(
        "ix_embed_tokens_token", "embed_tokens", ["token"], unique=True
    )


def downgrade() -> None:
    op.drop_table("embed_tokens")
