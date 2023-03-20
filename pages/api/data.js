/** 
 * @swagger
 *  /api/query_db_targets:
 *    post:
 *      summary: Identify upregulated targets
 *      description: Query a precomputed background to identify targets highly expressed in uploaded gene statistics and lowly expressed in normal tissues and cells.
 *      requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inputData:
 *                 type: object
 *                 properties:
 *                   n:
 *                     type: integer
 *                     description: number of samples
 *                     example: 5
 *                   genes:
 *                     type: object
 *                     properties:
 *                       A2M:
 *                         type: object
 *                         properties: 
 *                           mean:
 *                             type: object
 *                             description: the mean of given gene's expression
 *                             example: 5000.00
 *                           std:
 *                             type: object
 *                             description: the standard deviation of given gene's expression
 *                             example: 25.25
 *                       STAT3:
 *                         type: object
 *                         properties:
 *                           mean:
 *                             type: object
 *                             description: the mean of given gene's expression
 *                             example: 2306.5
 *                           std:
 *                             type: object
 *                             description: the standard deviation of given gene's expression
 *                             example: 5.31
 *
 *               bg:
 *                 type: string
 *                 description: The background resource to query ('ARCHS4', 'GTEx_transcriptomics', or 'Tabula_Sapiens')
 *                 example: 'ARCHS4'
 *      responses:
 *        200:
 *          description: Genes significantly upreguated compared to the chosen background
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               example: [{"gene": "A2M", "t": 2.2353498230814144, "p": 0.012697460635071326, "adj_p": 0.025394921270142652, "log2fc": 0.2853113363026605}, {"gene": "LAMP3", "t": 6.2353498230814144, "p": 0.00012697460635071326, "adj_p": 0.0000225394921270142652, "log2fc": 4.2853113363026605}]
*/