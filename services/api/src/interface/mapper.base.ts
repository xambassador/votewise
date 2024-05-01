export abstract class BaseMapper<DBEntity, DomainEntity, ResponseEntity> {
  /**
   * Transforms Domain Entity to Database Entity
   *
   * @param domainEntity Application/Domain Entity
   */
  abstract toPersistence(domainEntity: DomainEntity): DBEntity;

  /**
   * Transforms Database Entity to Domain Entity
   *
   * @param entity Database Entity
   */
  abstract toDomain(entity: DBEntity): DomainEntity;

  /**
   * Transforms Domain Entity to Response Entity
   *
   * @param entity Domain Entity
   */
  abstract toDTO(entity: DomainEntity): ResponseEntity;
}
