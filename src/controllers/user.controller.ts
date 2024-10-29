import { post, requestBody, HttpErrors } from '@loopback/rest';
import { User } from '../models';
import { UserRepository, UserRoleRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { Credentials, JWT_SECRET } from '../auth';
import { promisify } from 'util';
import * as bcrypt from 'bcryptjs';

const { sign } = require('jsonwebtoken');
const signAsync = promisify(sign);

export class UserController {
  constructor(
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(UserRoleRepository) private userRoleRepository: UserRoleRepository,
  ) { }

  @post('/users')
  async createUser(@requestBody() user: User): Promise<User> {
    if (!user.password) throw new HttpErrors.BadRequest('Password is required');

    // Hash the password before saving
    user.password = await bcrypt.hash(user.password, 10);
    return await this.userRepository.create(user);
  }

  @post('/users/login')
  async login(@requestBody() credentials: Credentials) {
    // Validate request
    if (!credentials.username || !credentials.password) {
      throw new HttpErrors.BadRequest('Missing Username or Password');
    }

    // Attempt to find user by username (or email)
    const user = await this.userRepository.findOne({ where: { id: credentials.username } });
    if (!user) throw new HttpErrors.Unauthorized('Invalid credentials');

    // Verify the hashed password
    const isPasswordMatched = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordMatched) {
      throw new HttpErrors.Unauthorized('Invalid credentials');
    }

    // Generate the JWT token
    const tokenPayload = { username: credentials.username };
    const token = await signAsync(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    // Retrieve user roles
    const roles = await this.userRoleRepository.find({ where: { userId: user.id } });
    const { id, email } = user;

    return {
      token,
      id,
      email,
      roles: roles.map(r => r.roleId),
    };
  }
}
