import {
  MethodDecoratorFactory,
  inject,
  CoreBindings,
  Constructor,
  MetadataInspector,
  Provider,
  ValueOrPromise,
  Getter,
  Setter,
  BindingKey,
} from '@loopback/core';
import {
  AUTHENTICATION_METADATA_KEY,
  AuthenticationMetadata,
  AuthenticationBindings,
  AuthenticateFn,
  AuthenticationStrategy,
} from '@loopback/authentication';
import { UserProfile, securityId } from '@loopback/security';
import { StrategyAdapter } from '@loopback/authentication-passport';
import { AuthMetadataProvider } from '@loopback/authentication/dist/providers/auth-metadata.provider';
import { UserRepository, UserRoleRepository } from './repositories';
import { repository } from '@loopback/repository';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { HttpErrors, Request } from '@loopback/rest';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

export const JWT_STRATEGY_NAME = 'jwt';
export const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecret'; // Ensure a secure value for production
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h'; // Set expiration from env

// The decorator function for secured access control
export function secured(
  type: SecuredType = SecuredType.IS_AUTHENTICATED,
  roles: string[] = [],
  strategy: string = 'jwt',
  options?: object,
) {
  return MethodDecoratorFactory.createDecorator<MyAuthenticationMetadata>(AUTHENTICATION_METADATA_KEY, {
    type,
    roles,
    strategy,
    options,
  });
}

export enum SecuredType {
  IS_AUTHENTICATED,
  PERMIT_ALL,
  HAS_ANY_ROLE,
  HAS_ROLES,
  DENY_ALL,
}

export interface MyAuthenticationMetadata extends AuthenticationMetadata {
  type: SecuredType;
  roles: string[];
}

export class MyAuthMetadataProvider extends AuthMetadataProvider {
  constructor(
    @inject(CoreBindings.CONTROLLER_CLASS, { optional: true }) protected _controllerClass: Constructor<{}>,
    @inject(CoreBindings.CONTROLLER_METHOD_NAME, { optional: true }) protected _methodName: string,
  ) {
    super(_controllerClass, _methodName);
  }

  value(): MyAuthenticationMetadata | undefined {
    if (!this._controllerClass || !this._methodName) return;
    return MetadataInspector.getMethodMetadata<MyAuthenticationMetadata>(
      AUTHENTICATION_METADATA_KEY,
      this._controllerClass.prototype,
      this._methodName,
    );
  }
}

export interface Credentials {
  username: string;
  password: string;
}

export namespace MyAuthBindings {
  export const STRATEGY = BindingKey.create<AuthenticationStrategy | undefined>('authentication.strategy');
}

export class MyAuthAuthenticationStrategyProvider implements Provider<AuthenticationStrategy | undefined> {
  constructor(
    @inject(AuthenticationBindings.METADATA) private metadata: MyAuthenticationMetadata,
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(UserRoleRepository) private userRoleRepository: UserRoleRepository,
  ) { }

  value(): ValueOrPromise<AuthenticationStrategy | undefined> {
    if (!this.metadata) return;

    const { strategy } = this.metadata;
    if (strategy === JWT_STRATEGY_NAME) {
      const jwtStrategy = new JwtStrategy(
        {
          secretOrKey: JWT_SECRET,
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        (payload, done) => this.verifyToken(payload, done),
      );
      return new StrategyAdapter(jwtStrategy, JWT_STRATEGY_NAME);
    }
  }

  async verifyToken(
    payload: Credentials,
    done: (err: Error | null, user?: UserProfile | false, info?: Object) => void,
  ) {
    try {
      const { username } = payload;
      const user = await this.userRepository.findById(username);
      if (!user) return done(null, false);

      await this.verifyRoles(username);

      done(null, { name: username, email: user.email, [securityId]: username });
    } catch (err: unknown) {
      if (err instanceof HttpErrors.HttpError && err.name === 'UnauthorizedError') {
        return done(null, false);
      } else if (err instanceof Error) {
        console.error('Unexpected error during token verification:', err.message);
        done(err, false);
      } else {
        console.error('Unknown error:', err);
        done(new Error('An unknown error occurred'), false);
      }
    }
  }

  async verifyRoles(username: string) {
    const { type, roles } = this.metadata;

    if ([SecuredType.IS_AUTHENTICATED, SecuredType.PERMIT_ALL].includes(type)) return;

    if (type === SecuredType.HAS_ANY_ROLE) {
      if (!roles.length) return;
      const { count } = await this.userRoleRepository.count({
        userId: username,
        roleId: { inq: roles },
      });

      if (count) return;
    } else if (type === SecuredType.HAS_ROLES && roles.length) {
      const userRoles = await this.userRoleRepository.find({ where: { userId: username } });
      const roleIds = userRoles.map(ur => ur.roleId);
      if (roles.every(role => roleIds.includes(role))) return;
    }

    throw new HttpErrors.Unauthorized('Invalid authorization');
  }
}

export class MyAuthActionProvider implements Provider<AuthenticateFn> {
  constructor(
    @inject.getter(MyAuthBindings.STRATEGY) readonly getStrategy: Getter<AuthenticationStrategy>,
    @inject.setter(AuthenticationBindings.CURRENT_USER) readonly setCurrentUser: Setter<UserProfile>,
    @inject.getter(AuthenticationBindings.METADATA) readonly getMetadata: Getter<MyAuthenticationMetadata>,
  ) { }

  value(): AuthenticateFn {
    return request => this.action(request);
  }

  async action(request: Request): Promise<UserProfile | undefined> {
    const metadata = await this.getMetadata();
    if (metadata && metadata.type === SecuredType.PERMIT_ALL) return;

    const strategy = await this.getStrategy();
    if (!strategy) return;

    const user = await strategy.authenticate(request);
    if (user) this.setCurrentUser(user);

    return user;
  }
}
