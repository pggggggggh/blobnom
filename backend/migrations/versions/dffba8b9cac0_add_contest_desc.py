"""add contest desc

Revision ID: dffba8b9cac0
Revises: 00b274b04fe9
Create Date: 2025-02-05 06:17:28.796451

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dffba8b9cac0'
down_revision: Union[str, None] = '00b274b04fe9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('contests', sa.Column('desc', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('contests', 'desc')
    # ### end Alembic commands ###
