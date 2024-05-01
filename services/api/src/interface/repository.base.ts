export abstract class BaseRepository<DomainEntity, DBEntity> {
  abstract find(): Promise<DBEntity[]>;
  abstract findById(id: string): Promise<DBEntity>;
  abstract create(entity: DomainEntity): Promise<DBEntity>;
  abstract update(id: string, entity: DomainEntity): Promise<DBEntity>;
  abstract delete(id: string): Promise<DBEntity>;
}
