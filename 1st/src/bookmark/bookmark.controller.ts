import { Controller, Get } from '@nestjs/common';

@Controller('bookmark')
export class BookmarkController {
    @Get()
    getBookmarks() {
        return 'This action returns all bookmarks';
    }
}
