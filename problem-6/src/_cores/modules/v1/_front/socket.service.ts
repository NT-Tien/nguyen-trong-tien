import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

export enum EventPushNotificationType {
  NOTIFICATION = 'notification',
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: `socket/notification`,
})
export class PushNotificationService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private readonly logger = new Logger(`${PushNotificationService.name} Gateway`);

  @WebSocketServer()
  server: Server;

  clientMap = new Map<string, string>(); // Map<user_id, client_id>

  constructor(
    private readonly jwtService: JwtService,
  ) {
    // setInterval(() => {
    //   let clients = this.server.sockets as any; // socket is a Map
    //   this.logger.log(`Number of connected clients: ${clients.size}`);
    // }, 5000);
    // set interval to emit event to all clients
    // setInterval(() => {
    //   this.server.emit('notification', { message: 'Notification from server' });
    // }, 5000);
  }

  private checkHeaderAuthorization(headers: any) {
    // check header authorization
    const authorization = headers.authorization;
    if (!authorization) {
      return null;
    }
    // convert jwt to user
    const token = authorization.split(' ')[1];
    try {
      const user = this.jwtService.verify(token);
      return user;
    } catch (error) {
      return null;
    }
  }

  handleConnection(client: Socket, ...args: any[]) {
    // get headers
    const headers = client.handshake.headers;
    let user = this.checkHeaderAuthorization(headers);
    if (!user) {
      client.disconnect();
      return;
    }
    // add client to map
    this.clientMap.set(user.id, client.id);
    // log client id
    console.log(`Client ID (${client.id}) - ${user.id}) connected at`, new Date().toLocaleString());
    // send event to client
    this.sendEventToSpecificClient(user.id, 'connected', { message: 'Connected to server' });
  }

  afterInit(server: any) {
    this.logger.log('Init socket notification');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ID (${client.id}) disconnected at`, new Date().toLocaleString());
    // remove client from map
    this.clientMap.forEach((value, key) => {
      if (value === client.id) {
        this.clientMap.delete(key);
      }
    });
  }

  // Method to send event to a specific client
  sendEventToSpecificClient(user_id: string, event: string, data?: any) {
    const clientId = this.clientMap.get(user_id);
    const clients = this.server.sockets as any; // socket is a Map
    const client = clients.get(clientId);
    if (client) {
      client.emit(event, data);
    } else {
      this.logger.warn(`Client with ID ${clientId} not found`);
    }
  }

  @OnEvent(EventPushNotificationType.NOTIFICATION)
  async processFunction(users: any, tenant_id: string, user: any = null) {
    for (const _user of users) {
      try {
        const data = { ..._user, _id: undefined, tenant_id };
        // await this.commonService.create(
        //   'notification',
        //   data,
        //   tenant_id, user || _user,
        // );
        _user.tenant_id = tenant_id;
        this.sendEventToSpecificClient(_user._id.toString(), EventPushNotificationType.NOTIFICATION, data );
      } catch (error) {
        this.logger.error(`Error when sending notification to user ${_user._id}`, error);
      }
    }
  }

}
