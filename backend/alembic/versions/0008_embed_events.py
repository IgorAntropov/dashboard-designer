from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0008_embed_events"
down_revision: str | None = "0007_dashboard_theme_tokens"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "embed_events",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "dashboard_id",
            sa.Uuid(),
            sa.ForeignKey("dashboards.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("count", sa.Integer(), nullable=False, server_default="0"),
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
        sa.UniqueConstraint(
            "dashboard_id", "day", name="uq_embed_events_dashboard_day"
        ),
    )
    op.create_index(
        "ix_embed_events_dashboard_id", "embed_events", ["dashboard_id"]
    )
    op.create_index("ix_embed_events_day", "embed_events", ["day"])


def downgrade() -> None:
    op.drop_table("embed_events")
