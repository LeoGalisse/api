import { Controller, Get } from '@nestjs/common';
import { ListLecturesUseCase } from 'src/domain/event/application/use-cases/lectures/list.service';

@Controller('/lectures')
export class ListLecturesController {
  constructor(private listUseCase: ListLecturesUseCase) {}

  @Get()
  async handle() {
    const result = await this.listUseCase.execute();

    const { lectures } = result;

    return {
      lectures,
    };
  }
}
