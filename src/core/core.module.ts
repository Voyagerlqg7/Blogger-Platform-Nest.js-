import { Module, Global} from '@nestjs/common';

@Global()
@Module({
    providers: [CoreConfig, LoggerService],
    exports: [CoreConfig, LoggerService],
})
export class CoreModule {}