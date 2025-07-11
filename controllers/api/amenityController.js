const db = require('../../config/db_sequelize');
const { asyncHandler, NotFoundError } = require('../../middlewares/errorHandler');

module.exports = {
    /**
     * @swagger
     * /api/amenities:
     *   get:
     *     summary: Lista todas as amenidades
     *     tags: [Amenities]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de amenidades retornada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Amenity'
     *       401:
     *         description: Token de autenticação inválido ou ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    index: asyncHandler(async (req, res) => {
        const amenities = await db.Amenity.findAll();
        res.json({ success: true, data: amenities });
    }),

    /**
     * @swagger
     * /api/amenities/{id}:
     *   get:
     *     summary: Busca uma amenidade por ID
     *     tags: [Amenities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID da amenidade
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Amenidade encontrada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Amenity'
     *       404:
     *         description: Amenidade não encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       401:
     *         description: Token de autenticação inválido ou ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    show: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const amenity = await db.Amenity.findByPk(id);
        if (!amenity) {
            throw new NotFoundError('Amenity not found');
        }
        res.json({ success: true, data: amenity });
    }),

    /**
     * @swagger
     * /api/amenities:
     *   post:
     *     summary: Cria uma nova amenidade
     *     tags: [Amenities]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AmenityCreate'
     *     responses:
     *       201:
     *         description: Amenidade criada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Amenity'
     *       400:
     *         description: Dados de entrada inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       401:
     *         description: Token de autenticação inválido ou ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       403:
     *         description: Acesso negado - apenas Admin/Manager
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    store: asyncHandler(async (req, res) => {
        const { name, description } = req.body;
        const newAmenity = await db.Amenity.create({ name, description });
        res.status(201).json({ success: true, data: newAmenity });
    }),

    /**
     * @swagger
     * /api/amenities/{id}:
     *   put:
     *     summary: Atualiza uma amenidade existente
     *     tags: [Amenities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID da amenidade
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AmenityCreate'
     *     responses:
     *       200:
     *         description: Amenidade atualizada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Amenity'
     *       400:
     *         description: Dados de entrada inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       404:
     *         description: Amenidade não encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       401:
     *         description: Token de autenticação inválido ou ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       403:
     *         description: Acesso negado - apenas Admin/Manager
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, description } = req.body;
        const amenity = await db.Amenity.findByPk(id);
        if (!amenity) {
            throw new NotFoundError('Amenity not found');
        }
        await amenity.update({ name, description });
        res.json({ success: true, data: amenity });
    }),

    /**
     * @swagger
     * /api/amenities/{id}:
     *   delete:
     *     summary: Remove uma amenidade
     *     tags: [Amenities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID da amenidade
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Amenidade removida com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Amenity deleted successfully"
     *       404:
     *         description: Amenidade não encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       401:
     *         description: Token de autenticação inválido ou ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       403:
     *         description: Acesso negado - apenas Admin/Manager
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    destroy: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const amenity = await db.Amenity.findByPk(id);
        if (!amenity) {
            throw new NotFoundError('Amenity not found');
        }
        await amenity.destroy();
        res.json({ success: true, message: 'Amenity deleted successfully' });
    })
};