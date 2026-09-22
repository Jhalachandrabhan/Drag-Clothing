import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as Entity from 'src/entities';
import { ApiResponseService } from 'src/common/api-response.service';

@Injectable()
export class ManagerDashboardService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async getDashboard(user: any) {
    const clientId = user?.clientId;
    if (!clientId) {
      throw {
        statusCode: 401,
        message: 'Invalid session',
        errorType: 'Unauthorized',
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const totalProducts = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'p')
        .where('p.clientId=:clientId', { clientId })
        .getCount();

      const totalProductVariants = await queryRunner.manager
        .createQueryBuilder(Entity.ProductVariant, 'pv')
        .innerJoin(Entity.Product, 'p', 'p.id = pv.productId')
        .where('p.clientId=:clientId', { clientId })
        .getCount();

      const totalInventory = await queryRunner.manager
        .createQueryBuilder(Entity.Inventory, 'i')
        .where('i.clientId=:clientId', { clientId })
        .getCount();

      const lowStockItems = await queryRunner.manager
        .createQueryBuilder(Entity.Inventory, 'i')
        .where('i.clientId=:clientId', { clientId })
        .andWhere('i.quantity<=:qty', { qty: 10 })
        .getCount();

      return this.apiResponse.success(
        'Manager dashboard fetched successfully',
        {
          totalProducts,
          totalProductVariants,
          totalInventory,
          lowStockItems,
        },
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Fetch dashboard failed';
      let errorType = 'Unprocessable Request';

      if (error.statusCode) {
        statusCode = error.statusCode;
        message = error.message ?? message;
        errorType = error.errorType ?? errorType;
      } else {
        message = error.message ?? message;
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
