import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../users/schemas/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // console.log('REQUIRED ROLES');
    // console.log(requiredRoles);

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user; // Assuming user data is attached to the request

    // console.log('USER ROLE');
    // console.log(user.role);

    if (!user) {
      return false; // No user found, deny access
    }
    return requiredRoles.includes(user.role); // Check if user has required role
  }
}
