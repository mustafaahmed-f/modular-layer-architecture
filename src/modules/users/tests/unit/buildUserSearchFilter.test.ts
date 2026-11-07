import { describe, expect, it } from 'vitest';
import { buildUserSearchFilter } from '../../utils/buildUserSearchFilter.js';

describe('buildUserSearchFilter', () => {
    it('returns an empty filter without a search term', () => {
        expect(buildUserSearchFilter()).toEqual({});
    });

    it('searches first name, last name and email', () => {
        expect(buildUserSearchFilter('jane')).toEqual({
            OR: [
                { firstName: { contains: 'jane' } },
                { lastName: { contains: 'jane' } },
                { email: { contains: 'jane' } },
            ],
        });
    });
});
