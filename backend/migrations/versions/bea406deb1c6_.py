"""empty message

Revision ID: bea406deb1c6
Revises: b74cb7821071
Create Date: 2025-01-19 16:16:52.422801

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'bea406deb1c6'
down_revision: Union[str, None] = 'b74cb7821071'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL에 Enum 타입 생성
    role_enum = sa.Enum('ADMIN', 'MEMBER', name='role')
    role_enum.create(op.get_bind(), checkfirst=True)

    # 테이블에 컬럼 추가
    op.add_column('members', sa.Column('role', role_enum, nullable=False, server_default='MEMBER'))


def downgrade() -> None:
    # 컬럼 삭제
    op.drop_column('members', 'role')

    # PostgreSQL에서 Enum 타입 제거
    role_enum = sa.Enum('ADMIN', 'MEMBER', name='role')
    role_enum.drop(op.get_bind(), checkfirst=True)
