import {
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { EventsService } from './events.service';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis.service';
import { UseInterceptors } from '@nestjs/common';
import { RateLimitInterceptor } from './rate-limit.interceptor';
import { GroupsService } from '../groups/groups.service';
import { UsersService } from '../users/users.service';
import { Types } from 'mongoose';

// Note do not apply AccessTokenGuard, ValidUserGuard here it will not restrict connection access
@WebSocketGateway({
  cors: { origin: '*' }, // TODO add allowed origins only
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly eventsService: EventsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly groupsService: GroupsService, // findGroupsOfUser
    private readonly usersService: UsersService, // findGroupsOfUser
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: any, ...args: any[]) {
    console.log('handleConnection');
    // console.log(client);
    // console.log(client.id);
    const accessToken = (
      client.handshake.headers.authorization ||
      client.handshake.query.access_token
    )?.replace('Bearer ', '');
    let connectionErrorMessage = '';
    const isBlacklisted = await this.redisService.get(accessToken);
    if (isBlacklisted) {
      connectionErrorMessage =
        'Access Token Is Black Listed, User has logged out.';
    }
    try {
      const decoded = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      const currentUnixTimestamp = Math.floor(new Date().getTime() / 1000);
      if (decoded.exp < currentUnixTimestamp) {
        connectionErrorMessage =
          'Access Token Is Expired, Please call otp/refresh and re attempt with that new access token.';
      }
    } catch (error) {
      connectionErrorMessage = 'Access Token Is Not Valid. OR ' + error.message;
    }
    if (connectionErrorMessage !== '') {
      client.emit('connectionError', connectionErrorMessage);
      client.disconnect();
    } else console.log('connected!');
  }

  isClientInGroup(client: Socket, groupId: string): boolean {
    const rooms = client.rooms;
    // console.log(rooms);
    for (const room of rooms) {
      // console.log(room);
      if (room === groupId) {
        return true;
      }
    }
    return false;
  }

  @SubscribeMessage('joinGroup')
  handleJoinGroup(client: Socket, data: { groupId: string }) {
    console.log('joinGroup');
    console.log(data);
    // console.log(this.isClientInGroup(client, data.groupId));
    if (!this.isClientInGroup(client, data.groupId)) client.join(data.groupId); // NOTE user joined a group
    // console.log(this.isClientInGroup(client, data.groupId));
  }

  @SubscribeMessage('leaveGroup')
  handleLeaveRoom(client: Socket, data: { groupId: string }) {
    console.log('leaveGroup');
    console.log(data);
    if (this.isClientInGroup(client, data.groupId)) client.leave(data.groupId); // NOTE user left a group
  }

  @SubscribeMessage('updateUserLocation')
  @UseInterceptors(RateLimitInterceptor)
  async handleUpdateLocation(
    client: Socket,
    data: { groupId: string; userId: string; updateUserLocationDto: any },
  ) {
    console.log('updateLocation');
    console.log(data);
    const updatedUser = await this.usersService.update(
      new Types.ObjectId(data.userId),
      data.updateUserLocationDto,
      {
        new: true,
      },
    );
    await this.groupsService.checkAndNotifyUserOwnerIfUserIsOutsideCircle(
      data.userId,
      updatedUser,
      function (groupId) {
        if (!this.isClientInGroup(client, groupId)) client.join(groupId); // NOTE if not joined that group will not receive that user update
        if (this.isClientInGroup(client, groupId))
          // NOTE make sure user is joined with that group only then that group can receive location update of that user
          client.to(groupId).emit('userLocationUpdate', {
            userId: data.userId,
            currentLocation: data.updateUserLocationDto.currentLocation,
          }); // NOTE received -> updateUserLocation &  emit -> userLocationUpdate
      },
    );
  }

  // @SubscribeMessage('createEvent')
  // create(@MessageBody() createEventDto: CreateEventDto) {
  //   return this.eventsService.create(createEventDto);
  // }

  // @SubscribeMessage('findAllEvents')
  // findAll() {
  //   return this.eventsService.findAll();
  // }

  // @SubscribeMessage('findOneEvent')
  // findOne(@MessageBody() id: number) {
  //   return this.eventsService.findOne(id);
  // }

  // @SubscribeMessage('updateEvent')
  // update(@MessageBody() updateEventDto: UpdateEventDto) {
  //   return this.eventsService.update(updateEventDto.id, updateEventDto);
  // }

  // @SubscribeMessage('removeEvent')
  // remove(@MessageBody() id: number) {
  //   return this.eventsService.remove(id);
  // }
}
