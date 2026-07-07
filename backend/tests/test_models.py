import uuid

from sqlalchemy.orm import DeclarativeBase

from app.models.mixins import TimestampMixin, UuidPkMixin


def test_uuid_pk_default_generates_unique_uuids() -> None:
    class Base(DeclarativeBase):
        pass

    class Thing(UuidPkMixin, TimestampMixin, Base):
        __tablename__ = "thing"

    id_column = Thing.__table__.c.id
    assert id_column.primary_key is True

    first = id_column.default.arg()
    second = id_column.default.arg()
    assert isinstance(first, uuid.UUID)
    assert first != second


def test_timestamp_columns_present() -> None:
    class Base(DeclarativeBase):
        pass

    class Row(UuidPkMixin, TimestampMixin, Base):
        __tablename__ = "row"

    columns = Row.__table__.c
    assert "created_at" in columns
    assert "updated_at" in columns
