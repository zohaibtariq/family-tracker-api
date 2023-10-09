import {
  Document,
  FilterQuery,
  Model,
  PipelineStage,
  Types,
  UpdateQuery,
} from 'mongoose';

export abstract class EntityRepository<T extends Document> {
  protected constructor(protected readonly entityModel: Model<T>) {}

  async findOne(
    entityFilterQuery: FilterQuery<T>,
    projection: Record<string, unknown> = {},
  ): Promise<T | null> {
    return this.entityModel
      .findOne(entityFilterQuery, {
        __v: 0,
        ...projection,
      })
      .exec();
  }

  async find(
    entityFilterQuery: FilterQuery<T> = {},
    projection: Record<string, unknown> = {},
  ): Promise<T[] | null> {
    return this.entityModel
      .find(entityFilterQuery, {
        __v: 0,
        ...projection,
      })
      .exec();
  }

  async countDocuments(
    entityFilterQuery: FilterQuery<T> = {},
  ): Promise<number> {
    return this.entityModel.countDocuments(entityFilterQuery);
  }

  async findById(
    _id: Types.ObjectId,
    projection: Record<string, unknown> = {},
  ): Promise<T | null> {
    return this.entityModel.findById(_id, {
      __v: 0,
      ...projection,
    });
  }

  async create(createEntityData: unknown): Promise<any> {
    const createEntity = new this.entityModel(createEntityData);
    return createEntity.save();
  }

  async findOneAndUpdate(
    entityFilterQuery: FilterQuery<T>,
    updateEntityData: UpdateQuery<unknown>,
    options: Record<string, unknown> = {},
  ): Promise<T | null> {
    return this.entityModel.findOneAndUpdate(
      entityFilterQuery,
      updateEntityData,
      options,
    );
  }

  async findByIdAndUpdate(
    id: Types.ObjectId,
    updateEntityData: UpdateQuery<unknown>,
    options: Record<string, unknown> = {},
  ): Promise<T | null> {
    return this.entityModel.findByIdAndUpdate(id, updateEntityData, options);
  }

  async findByIdAndDelete(id: Types.ObjectId): Promise<T | null> {
    return this.entityModel.findByIdAndDelete(id).exec();
  }

  async deleteMany(entityFilterQuery: FilterQuery<T>): Promise<boolean> {
    const deleteResult = await this.entityModel.deleteMany(entityFilterQuery);
    return deleteResult.deletedCount >= 1;
  }

  async findByIdAndRemove(id: Types.ObjectId): Promise<boolean> {
    return this.entityModel.findByIdAndRemove(id);
  }

  async insertMany(data: unknown): Promise<Array<T>> {
    return this.entityModel.insertMany(data);
  }

  async aggregate(aggregationPipeline: PipelineStage[]): Promise<any[]> {
    return this.entityModel.aggregate(aggregationPipeline).exec();
  }

  async findOneWithSelect(
    entityFilterQuery: FilterQuery<T>,
    selectFields:
      | string
      | string[]
      | Record<string, number | boolean | object> = {},
    projection: Record<string, unknown> = {},
  ): Promise<T | null> {
    return this.entityModel
      .findOne(entityFilterQuery, {
        __v: 0,
        ...projection,
      })
      .select(selectFields)
      .exec();
  }

  async findWithSelect(
    entityFilterQuery: FilterQuery<T> = {},
    selectFields:
      | string
      | string[]
      | Record<string, number | boolean | object> = {},
    projection: Record<string, unknown> = {},
  ): Promise<T[] | null> {
    return this.entityModel
      .find(entityFilterQuery, {
        __v: 0,
        ...projection,
      })
      .select(selectFields)
      .exec();
  }
}
