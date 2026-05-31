import { ImageService } from './image.service';
import { ImageRepository } from './image.repository';
import type { Image } from './image.schema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeImage(overrides: Partial<Image> = {}): Image {
  return {
    id: 'img-1',
    publicId: 'folder/my-image',
    secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/my-image.jpg',
    width: 800,
    height: 600,
    createdAt: new Date(),
    ...overrides,
  };
}

function buildService() {
  const repo = {
    findAll: jest.fn().mockResolvedValue({ data: [makeImage()], total: 1 }),
    create: jest.fn().mockResolvedValue(makeImage()),
  } as unknown as ImageRepository;

  const service = new ImageService(repo);
  return { service, repo };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ImageService', () => {
  describe('findAll', () => {
    it('returns paginated images from the repository', async () => {
      const { service, repo } = buildService();

      const result = await service.findAll(0, 10);

      expect(repo.findAll).toHaveBeenCalledWith(0, 10);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('uses default page size of 20 when limit is undefined', async () => {
      const { service, repo } = buildService();

      await service.findAll(0, undefined);

      const [, limit] = (repo.findAll as jest.Mock).mock.calls[0] as [
        number,
        number,
      ];
      expect(limit).toBe(20);
    });

    it('clamps limit to a maximum of 100', async () => {
      const { service, repo } = buildService();

      await service.findAll(0, 9999);

      const [, limit] = (repo.findAll as jest.Mock).mock.calls[0] as [
        number,
        number,
      ];
      expect(limit).toBe(100);
    });

    it('enforces minimum limit of 1', async () => {
      const { service, repo } = buildService();

      await service.findAll(0, 0);

      const [, limit] = (repo.findAll as jest.Mock).mock.calls[0] as [
        number,
        number,
      ];
      expect(limit).toBe(1);
    });

    it('clamps negative offset to 0', async () => {
      const { service, repo } = buildService();

      await service.findAll(-5, 10);

      const [offset] = (repo.findAll as jest.Mock).mock.calls[0] as [
        number,
        number,
      ];
      expect(offset).toBe(0);
    });

    it('passes positive offset through unchanged', async () => {
      const { service, repo } = buildService();

      await service.findAll(40, 20);

      const [offset] = (repo.findAll as jest.Mock).mock.calls[0] as [
        number,
        number,
      ];
      expect(offset).toBe(40);
    });

    it('defaults offset to 0 when undefined', async () => {
      const { service, repo } = buildService();

      await service.findAll(undefined, 10);

      const [offset] = (repo.findAll as jest.Mock).mock.calls[0] as [
        number,
        number,
      ];
      expect(offset).toBe(0);
    });

    it('returns empty data when repository returns no images', async () => {
      const { service, repo } = buildService();
      (repo.findAll as jest.Mock).mockResolvedValue({ data: [], total: 0 });

      const result = await service.findAll();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('create', () => {
    it('creates an image record and returns it', async () => {
      const { service, repo } = buildService();
      const dto = {
        publicId: 'folder/new-image',
        secureUrl:
          'https://res.cloudinary.com/demo/image/upload/v1/new-image.jpg',
        width: 1200,
        height: 900,
      };

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith({
        publicId: dto.publicId,
        secureUrl: dto.secureUrl,
        width: dto.width,
        height: dto.height,
      });
      expect(result.id).toBe('img-1');
    });

    it('propagates repository errors', async () => {
      const { service, repo } = buildService();
      (repo.create as jest.Mock).mockRejectedValue(new Error('DB constraint'));

      await expect(
        service.create({
          publicId: 'x',
          secureUrl: 'https://example.com/x.jpg',
          width: 100,
          height: 100,
        }),
      ).rejects.toThrow('DB constraint');
    });
  });
});
