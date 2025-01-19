"""empty message

Revision ID: b2739afedac4
Revises: 298cb2dc738e
Create Date: 2025-01-19 19:03:12.167160

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2739afedac4'
down_revision: Union[str, None] = '298cb2dc738e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('rooms', sa.Column('winner', sa.String(), nullable=False, server_default=''))
    op.add_column('rooms', sa.Column('num_solved_missions', sa.Integer(), nullable=False, server_default='0'))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('rooms', 'num_solved_missions')
    op.drop_column('rooms', 'winner')
    # ### end Alembic commands ###
