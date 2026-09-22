import { Injectable, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponseService } from 'src/common/api-response.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly apiResponse: ApiResponseService,
  ) {}

  async getSummary(_user: any) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const totalOrders = await queryRunner.manager
        .createQueryBuilder()
        .select('COUNT(o.id)', 'count')
        .from('orders', 'o')
        .where('o.client_id = :clientId', { clientId })
        .getRawOne();

      const totalRevenue = await queryRunner.manager
        .createQueryBuilder()
        .select('COALESCE(SUM(o.total_amount),0)', 'total')
        .from('orders', 'o')
        .where('o.client_id = :clientId', { clientId })
        .getRawOne();

      const totalProductsSold = await queryRunner.manager
        .createQueryBuilder()
        .select('COALESCE(SUM(oi.quantity),0)', 'total')
        .from('order_items', 'oi')
        .leftJoin('orders', 'o', 'o.id = oi.order_id')
        .where('o.client_id = :clientId', { clientId })
        .getRawOne();

      const totalActiveDiscounts = await queryRunner.manager
        .createQueryBuilder()
        .select('COUNT(d.id)', 'count')
        .from('discounts', 'd')
        .where('d.client_id = :clientId', { clientId })
        .andWhere('d.is_active = true')
        .getRawOne();

      const data = {
        totalOrders: Number(totalOrders.count),
        totalRevenue: Number(totalRevenue.total),
        totalProductsSold: Number(totalProductsSold.total),
        totalActiveDiscounts: Number(totalActiveDiscounts.count),
      };

      return this.apiResponse.success(
        'Summary report fetched successfully',
        data,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Summary report failed';
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

  async getProductReport(_user: any) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const products = await queryRunner.manager
        .createQueryBuilder()
        .select([
          'p.id AS productId',
          'p.name AS productName',
          'COALESCE(SUM(oi.quantity),0) AS totalSold',
          'COALESCE(SUM(oi.quantity * oi.price),0) AS revenue',
        ])
        .from('products', 'p')
        .leftJoin('order_items', 'oi', 'oi.product_id = p.id')
        .leftJoin('orders', 'o', 'o.id = oi.order_id')
        .where('p.client_id = :clientId', { clientId })
        .groupBy('p.id')
        .orderBy('totalSold', 'DESC')
        .getRawMany();

      return this.apiResponse.success(
        'Product report fetched successfully',
        products,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Product report failed';
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

  async getManagerReport(_user: any) {
    const clientId = _user.clientId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const managers = await queryRunner.manager
        .createQueryBuilder()
        .select([
          'u.id AS managerId',
          'u.name AS managerName',
          'COUNT(o.id) AS totalOrders',
          'COALESCE(SUM(o.total_amount),0) AS revenue',
        ])
        .from('users', 'u')
        .leftJoin('orders', 'o', 'o.manager_id = u.id')
        .where('u.client_id = :clientId', { clientId })
        .andWhere('u.role = "MANAGER"')
        .groupBy('u.id')
        .orderBy('revenue', 'DESC')
        .getRawMany();

      return this.apiResponse.success(
        'Manager report fetched successfully',
        managers,
        200,
      );
    } catch (error: any) {
      let statusCode = 422;
      let message = 'Manager report failed';
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
