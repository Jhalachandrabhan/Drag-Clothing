import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as Entity from 'src/entities';
import { ApiResponseService } from 'src/common/api-response.service';

@Injectable()
export class ClientDashboardService {
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

      const totalInventory = await queryRunner.manager
        .createQueryBuilder(Entity.Inventory, 'i')
        .where('i.clientId=:clientId', { clientId })
        .getCount();

      const totalOrders = await queryRunner.manager
        .createQueryBuilder(Entity.Order, 'o')
        .where('o.clientId=:clientId', { clientId })
        .getCount();

      const totalManagers = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'u')
        .where('u.clientId=:clientId', { clientId })
        .andWhere('u.role=:role', { role: 'manager' })
        .getCount();

      const lowStockProducts = await queryRunner.manager
        .createQueryBuilder(Entity.Inventory, 'i')
        .where('i.clientId=:clientId', { clientId })
        .andWhere('i.quantity<=:qty', { qty: 10 })
        .getCount();

      return this.apiResponse.success(
        'Dashboard fetched successfully',
        {
          totalProducts,
          totalInventory,
          totalOrders,
          totalManagers,
          lowStockProducts,
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
