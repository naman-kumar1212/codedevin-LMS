import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('students')
  getStudents(@Query('search') search?: string) {
    return this.adminService.getStudents(search);
  }

  @Get('students/:id')
  getStudent(@Param('id') id: string) {
    return this.adminService.getStudent(id);
  }

  @Get('certificates')
  getCertificates() {
    return this.adminService.getCertificates();
  }
}
