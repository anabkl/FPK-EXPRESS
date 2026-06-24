"""Create the authenticated live MVP schema.

Revision ID: 20260622_0001
Revises:
Create Date: 2026-06-22
"""

from alembic import op
import sqlalchemy as sa


revision = "20260622_0001"
down_revision = None
branch_labels = None
depends_on = None


def _create_users() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role", "users", ["role"])


def _create_partners() -> None:
    op.create_table(
        "snack_partners",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("address", sa.String(length=240), nullable=False),
        sa.Column("is_open", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_snack_partners_id", "snack_partners", ["id"])
    op.create_index("ix_snack_partners_name", "snack_partners", ["name"])
    op.create_index("ix_snack_partners_owner_id", "snack_partners", ["owner_id"])


def _create_meals() -> None:
    op.create_table(
        "meals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("snack_partner_id", sa.Integer(), sa.ForeignKey("snack_partners.id"), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("category", sa.String(length=60), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=False, server_default=""),
        sa.Column("preparation_time", sa.Integer(), nullable=False),
        sa.Column("is_available", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("popularity_score", sa.Integer(), nullable=False, server_default="50"),
        sa.Column("stock_quantity", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_meals_id", "meals", ["id"])
    op.create_index("ix_meals_snack_partner_id", "meals", ["snack_partner_id"])
    op.create_index("ix_meals_name", "meals", ["name"])
    op.create_index("ix_meals_category", "meals", ["category"])


def _create_orders() -> None:
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_reference", sa.String(length=24), nullable=False, unique=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("snack_partner_id", sa.Integer(), sa.ForeignKey("snack_partners.id"), nullable=False),
        sa.Column("meal_id", sa.Integer(), sa.ForeignKey("meals.id"), nullable=False),
        sa.Column("student_department", sa.String(length=40), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("pickup_time", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="Pending"),
        sa.Column("payment_method", sa.String(length=30), nullable=False, server_default="PayOnPickup"),
        sa.Column("payment_status", sa.String(length=30), nullable=False, server_default="PayOnPickup"),
        sa.Column("total_price", sa.Float(), nullable=False),
        sa.Column("estimated_waiting_time", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_orders_id", "orders", ["id"])
    op.create_index("ix_orders_order_reference", "orders", ["order_reference"], unique=True)
    op.create_index("ix_orders_student_id", "orders", ["student_id"])
    op.create_index("ix_orders_snack_partner_id", "orders", ["snack_partner_id"])
    op.create_index("ix_orders_meal_id", "orders", ["meal_id"])
    op.create_index("ix_orders_student_department", "orders", ["student_department"])
    op.create_index("ix_orders_status", "orders", ["status"])
    op.create_index("ix_orders_payment_status", "orders", ["payment_status"])
    op.create_index("ix_orders_created_at", "orders", ["created_at"])


def _drop_legacy_indexes(inspector: sa.Inspector, table_name: str) -> None:
    for index in inspector.get_indexes(table_name):
        if index.get("name"):
            op.drop_index(index["name"], table_name=table_name)


def upgrade() -> None:
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    tables = set(inspector.get_table_names())

    legacy_meals = "meals" in tables and "snack_partner_id" not in {
        column["name"] for column in inspector.get_columns("meals")
    }

    if legacy_meals:
        if "orders" in tables:
            _drop_legacy_indexes(inspector, "orders")
            op.rename_table("orders", "orders_legacy")
        _drop_legacy_indexes(inspector, "meals")
        op.rename_table("meals", "meals_legacy")
        tables.discard("orders")
        tables.discard("meals")

    if "users" not in tables:
        _create_users()
    if "snack_partners" not in tables:
        _create_partners()
    if "meals" not in tables:
        _create_meals()
    if "orders" not in tables:
        _create_orders()

    if legacy_meals:
        op.execute(
            sa.text(
                "INSERT INTO snack_partners (name, address, is_open, created_at, updated_at) "
                "VALUES ('Snack Campus Atlas', 'À proximité de la FPK Khouribga', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            )
        )
        op.execute(
            sa.text(
                "INSERT INTO meals (id, snack_partner_id, name, category, price, description, image_url, "
                "preparation_time, is_available, popularity_score, stock_quantity, created_at, updated_at) "
                "SELECT id, (SELECT MIN(id) FROM snack_partners), name, category, price, description, image_url, "
                "preparation_time, is_available, popularity_score, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP "
                "FROM meals_legacy"
            )
        )
        if "orders_legacy" in sa.inspect(connection).get_table_names():
            op.drop_table("orders_legacy")
        op.drop_table("meals_legacy")


def downgrade() -> None:
    op.drop_table("orders")
    op.drop_table("meals")
    op.drop_table("snack_partners")
    op.drop_table("users")
