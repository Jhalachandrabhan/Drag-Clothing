import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';
import * as Entity from 'src/entities';
import { CreateManagerProductDto } from '../Dto/create-product.dto';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from 'src/Modules/Audit-log/audit-log.service';

@Injectable()
export class ManagerProductsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
    private readonly auditService: AuditService,
  ) {}

  //  async createProduct(_user: any, dto: CreateManagerProductDto) {

  //   const clientId = _user.clientId;
  //   const managerId = _user.id;

  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {

  //     // Validate category exists
  //     const category = await queryRunner.manager
  //       .createQueryBuilder(Entity.Category, 'category')
  //       .where('category.id = :categoryId', { categoryId: dto.categoryId })
  //       .getOne();

  //     if (!category) {
  //       throw {
  //         statusCode: 404,
  //         message: 'Category not found',
  //         errorType: 'Not Found',
  //       };
  //     }

  //     // Create product
  //     const product = queryRunner.manager.create(Entity.Product, {
  //       id: uuidv4(),
  //       clientId,
  //       categoryId: dto.categoryId,
  //       name: dto.name,
  //       description: dto.description,
  //       price: dto.price,
  //       isActive: true,
  //       createdBy: managerId,
  //     });

  //     await queryRunner.manager.save(Entity.Product, product);
  //     await this.auditService.createAuditLogWithQueryRunner(queryRunner, _user, {
  //       action: 'CREATE',
  //       entity: 'PRODUCT',
  //       entityId: product.id,
  //       clientId,
  //       newValue: {
  //         categoryId: product.categoryId,
  //         name: product.name,
  //         description: product.description,
  //         price: product.price,
  //       },
  //     });

  //     await queryRunner.commitTransaction();

  //     return this.apiResponse.success(
  //       'Product created successfully',
  //       {
  //         productId: product.id,
  //         name: product.name,
  //       },
  //       201,
  //     );

  //   }
  //   catch (error: any) {

  //     if (queryRunner.isTransactionActive) {
  //       await queryRunner.rollbackTransaction();
  //     }

  //     let statusCode = 422;
  //     let message = 'Create product failed';
  //     let errorType = 'Unprocessable Request';

  //     if (error?.statusCode) {
  //       statusCode = error.statusCode;
  //       message = error.message ?? message;
  //       errorType = error.errorType ?? errorType;
  //     }
  //     else if (error?.message) {
  //       message = error.message;
  //     }

  //     throw new HttpException(
  //       this.apiResponse.error(message, statusCode, errorType),
  //       statusCode,
  //     );

  //   }
  //   finally {
  //     await queryRunner.release();
  //   }

  // }

  async getProducts(_user: any) {
    const clientId = _user.clientId;
    const managerId = _user.id;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const products = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'product')
        .innerJoin(
          Entity.Inventory,
          'inventory',
          'inventory.productId = product.id AND inventory.clientId = :clientId AND inventory.managerId = :managerId',
          { clientId, managerId },
        )
        .select([
          'product.id AS productId',
          'product.name AS name',
          'product.description AS description',
          'product.price AS price',
          'product.isActive AS isActive',
          'product.createdAt AS createdAt',
          'product.categoryId AS categoryId',
          'product.gender AS gender',
          'inventory.quantity AS assignedQuantity',
        ])
        .where('product.clientId = :clientId', { clientId })
        .orderBy('product.createdAt', 'DESC')
        .getRawMany();

      return this.apiResponse.success(
        'Products fetched successfully',
        products,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch products failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getProduct(_user: any, productId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const product = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'product')
        .where('product.id = :productId', { productId })
        .andWhere('product.clientId = :clientId', { clientId })
        .getOne();

      if (!product) {
        throw {
          statusCode: 404,
          message: 'Product not found',
          errorType: 'Not Found',
        };
      }

      return this.apiResponse.success(
        'Product fetched successfully',
        product,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch product failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateProduct(_user: any, productId: string, dto: any) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'product')
        .where('product.id = :productId', { productId })
        .andWhere('product.clientId = :clientId', { clientId })
        .getOne();

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Product not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Product)
        .set({ name: dto.name, description: dto.description, price: dto.price })
        .where('id = :productId', { productId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'UPDATE',
          entity: 'PRODUCT',
          entityId: productId,
          clientId,
          oldValue: {
            name: existing.name,
            description: existing.description,
            price: existing.price,
          },
          newValue: {
            name: dto.name,
            description: dto.description,
            price: dto.price,
          },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Product updated successfully',
        { productId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Update product failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteProduct(_user: any, productId: string) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'product')
        .where('product.id = :productId', { productId })
        .andWhere('product.clientId = :clientId', { clientId })
        .getOne();

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Product not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Entity.Product)
        .where('id = :productId', { productId })
        .andWhere('clientId = :clientId', { clientId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'DELETE',
          entity: 'PRODUCT',
          entityId: productId,
          clientId,
          oldValue: {
            id: existing.id,
            name: existing.name,
            price: existing.price,
            isActive: existing.isActive,
          },
          newValue: null,
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Product permanently deleted successfully',
        { productId },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Delete product failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      }

      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async setProductLive(_user: any, productId: string, isActive: boolean) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'product')
        .where('product.id = :productId', { productId })
        .andWhere('product.clientId = :clientId', { clientId })
        .getOne();

      if (!existing) {
        throw {
          statusCode: 404,
          message: 'Product not found',
          errorType: 'Not Found',
        };
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Entity.Product)
        .set({ isActive })
        .where('id = :productId', { productId })
        .andWhere('clientId = :clientId', { clientId })
        .execute();

      await this.auditService.createAuditLogWithQueryRunner(
        queryRunner,
        _user,
        {
          action: 'UPDATE_LIVE_STATUS',
          entity: 'PRODUCT',
          entityId: productId,
          clientId,
          oldValue: { isActive: existing.isActive },
          newValue: { isActive },
        },
      );

      await queryRunner.commitTransaction();

      return this.apiResponse.success(
        'Product live status updated',
        { productId, isActive },
        200,
      );
    } catch (error: any) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();

      let statusCode = 422;
      let message = 'Live update product failed';
      let errorType = 'Unprocessable Request';

      if (error?.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else if (error?.message) {
        message = error.message;
      }
      throw new HttpException(
        this.apiResponse.error(message, statusCode, errorType),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
