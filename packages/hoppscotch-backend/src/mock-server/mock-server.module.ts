import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MockServerService } from './mock-server.service';
import { MockServerAnalyticsService } from './mock-server-analytics.service';
import { MockServerLoggingInterceptor } from './mock-server-logging.interceptor';
import { MockServerResolver } from './mock-server.resolver';
import { TeamModule } from 'src/team/team.module';
import { TeamRequestModule } from 'src/team-request/team-request.module';
import { MockServerController } from './mock-server.controller';
import { AccessTokenModule } from 'src/access-token/access-token.module';

@Module({
  imports: [PrismaModule, TeamModule, TeamRequestModule, AccessTokenModule],
  controllers: [MockServerController],
  providers: [
    MockServerService,
    MockServerAnalyticsService,
    MockServerLoggingInterceptor,
    MockServerResolver,
  ],
})
export class MockServerModule {}
