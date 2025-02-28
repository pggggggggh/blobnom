"""modetype land_grab_single -> practice_linear

Revision ID: 774b95b69fc6
Revises: a2268f195cf7
Create Date: 2025-02-28 19:17:24.956279

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '774b95b69fc6'
down_revision: Union[str, None] = 'a2268f195cf7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE modetype RENAME VALUE 'LAND_GRAB_SINGLE' TO 'PRACTICE_LINEAR'")


def downgrade() -> None:
    op.execute("ALTER TYPE modetype RENAME VALUE 'PRACTICE_LINEAR' TO 'LAND_GRAB_SINGLE'")
