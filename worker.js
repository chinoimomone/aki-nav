/**
 * 備用随机 SVG 圖標 - 优化设计
 */
export const fallbackSVGIcons = [
  `<svg width="80" height="80" viewBox="0 0 24 24" fill="url(#gradient1)" xmlns="http://www.w3.org/2000/svg">
     <defs>
       <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
         <stop offset="0%" stop-color="#7209b7" />
         <stop offset="100%" stop-color="#4cc9f0" />
       </linearGradient>
     </defs>
     <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
   </svg>`,
  `<svg width="80" height="80" viewBox="0 0 24 24" fill="url(#gradient2)" xmlns="http://www.w3.org/2000/svg">
     <defs>
       <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
         <stop offset="0%" stop-color="#4361ee" />
         <stop offset="100%" stop-color="#4cc9f0" />
       </linearGradient>
     </defs>
     <circle cx="12" cy="12" r="10"/>
     <path d="M12 7v5l3.5 3.5 1.42-1.42L14 11.58V7h-2z" fill="#fff"/>
   </svg>`,
  `<svg width="80" height="80" viewBox="0 0 24 24" fill="url(#gradient3)" xmlns="http://www.w3.org/2000/svg">
     <defs>
       <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
         <stop offset="0%" stop-color="#7209b7" />
         <stop offset="100%" stop-color="#4361ee" />
       </linearGradient>
     </defs>
     <path d="M12 .587l3.668 7.431L24 9.172l-6 5.843 1.416 8.252L12 19.771l-7.416 3.496L6 15.015 0 9.172l8.332-1.154z"/>
   </svg>`,
];

function getRandomSVG() {
  return fallbackSVGIcons[Math.floor(Math.random() * fallbackSVGIcons.length)];
}

/**
 * 查找网站的 Favicon
 * @param {string} urlString - 目标网站的 URL
 * @returns {Promise<string|null>} - 返回图标的 URL 或 null
 */
async function findFavicon(urlString) {
  try {
    const url = new URL(urlString);
    let iconUrl = null;

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.ok) {
      const rewriter = new HTMLRewriter();
      let highestQualityIcon = null;

      rewriter.on('link[rel*="icon"]', {
        element(element) {
          const href = element.getAttribute('href');
          
          if (href) {
            if (element.getAttribute('rel') === 'apple-touch-icon') {
              highestQualityIcon = href;
            } else if (!highestQualityIcon) {
              highestQualityIcon = href;
            }
          }
        },
      });

      await rewriter.transform(response).text();

      if (highestQualityIcon) {
        iconUrl = new URL(highestQualityIcon, url.toString()).toString();
      }
    }

    if (!iconUrl) {
      const faviconIcoUrl = new URL('/favicon.ico', url.toString()).toString();
      const headResponse = await fetch(faviconIcoUrl, { method: 'HEAD' });
      if (headResponse.ok) {
        iconUrl = faviconIcoUrl;
      }
    }

    return iconUrl;

  } catch (error) {
    console.error(`Failed to find favicon for ${urlString}:`, error.message);
    return null;
  }
}
  
  /**
   * 处理 API 请求
   */
  const api = {
    async handleRequest(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname.replace('/api', '');
        const method = request.method;
        const id = url.pathname.split('/').pop();
        try {
            if (path === '/catalogs') {
                switch (method) {
                    case 'GET':
                        return await this.getCatalogs(request, env, ctx);
                    // [NEW] 增加 POST 方法用于创建分类
                    case 'POST':
                        return await this.createCatalog(request, env, ctx);
                    case 'PUT':
                        return await this.updateCatalog(request, env, ctx);
                    case 'DELETE':
                        return await this.deleteCatalog(request, env, ctx);
                    default:
                        return this.errorResponse('Method Not Allowed', 405)
                }
            }
            if (path === '/catalogs/reorder' && method === 'POST') {
                return await this.reorderCatalogs(request, env, ctx);
            }
            if (path === '/catalogs/migrate' && method === 'POST') {
                return await this.migrateCatalogs(request, env, ctx);
            }
            // --- [NEW] 切換分類隱私狀態的路由 ---
            if (path.match(/^\/catalogs\/\d+\/toggle_privacy$/) && method === 'PUT') {
                const catalogId = path.split('/')[2];
                return await this.toggleCatalogPrivacy(request, env, ctx, catalogId);
            }
            if (path === '/config') {
                switch (method) {
                    case 'GET':
                        return await this.getConfig(request, env, ctx, url);
                    case 'POST':
                        return await this.createConfig(request, env, ctx);
                    default:
                        return this.errorResponse('Method Not Allowed', 405)
                }
            }
            if (path === '/config/reorder' && method === 'POST') {
                return await this.reorderConfig(request, env, ctx);
            }
            if (path === '/config/all' && method === 'DELETE') {
                return await this.deleteAllConfigs(request, env, ctx);
            }
            if (path === '/config/submit' && method === 'POST') {
              return await this.submitConfig(request, env, ctx);
           }
            if (path === `/config/${id}` && /^\d+$/.test(id)) {
                switch (method) {
                    case 'PUT':
                        return await this.updateConfig(request, env, ctx, id);
                    case 'DELETE':
                        return await this.deleteConfig(request, env, ctx, id);
                    default:
                        return this.errorResponse('Method Not Allowed', 405)
                }
            }
            // --- [NEW] 切換書籤隱私狀態的路由 ---
            if (path.match(/^\/config\/\d+\/toggle_privacy$/) && method === 'PUT') {
                const siteId = path.split('/')[2];
                return await this.toggleSitePrivacy(request, env, ctx, siteId);
            }
            if (path === `/pending/${id}` && /^\d+$/.test(id)) {
                switch (method) {
                    case 'PUT':
                        return await this.approvePendingConfig(request, env, ctx, id);
                    case 'DELETE':
                        return await this.rejectPendingConfig(request, env, ctx, id);
                    default:
                        return this.errorResponse('Method Not Allowed', 405)
                }
            }
            if (path === '/config/import' && method === 'POST') {
                return await this.importConfig(request, env, ctx);
            }
            if (path === '/config/export' && method === 'GET') {
                return await this.exportConfig(request, env, ctx);
            }
            if (path === '/pending' && method === 'GET') {
              return await this.getPendingConfig(request, env, ctx, url);
            }
            return this.errorResponse('Not Found', 404);
        } catch (error) {
            return this.errorResponse(`Internal Server Error: ${error.message}`, 500);
        }
    },
      // --- [MODIFIED] 後台獲取書籤時，獲取所有書籤 ---
      async getConfig(request, env, ctx, url) {
              const catalog = url.searchParams.get('catalog');
              const page = parseInt(url.searchParams.get('page') || '1', 10);
              const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
              const keyword = url.searchParams.get('keyword');
              const offset = (page - 1) * pageSize;
              try {
                  let query = `SELECT * FROM sites ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
                  let countQuery = `SELECT COUNT(*) as total FROM sites`;
                  let queryBindParams = [pageSize, offset];
                  let countQueryParams = [];
  
                  if (catalog) {
                      query = `SELECT * FROM sites WHERE catelog = ? ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
                      countQuery = `SELECT COUNT(*) as total FROM sites WHERE catelog = ?`
                      queryBindParams = [catalog, pageSize, offset];
                      countQueryParams = [catalog];
                  }
  
                  if (keyword) {
                      const likeKeyword = `%${keyword}%`;
                      query = `SELECT * FROM sites WHERE name LIKE ? OR url LIKE ? OR catelog LIKE ? ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
                      countQuery = `SELECT COUNT(*) as total FROM sites WHERE name LIKE ? OR url LIKE ? OR catelog LIKE ?`;
                      queryBindParams = [likeKeyword, likeKeyword, likeKeyword, pageSize, offset];
                      countQueryParams = [likeKeyword, likeKeyword, likeKeyword];
  
                      if (catalog) {
                          query = `SELECT * FROM sites WHERE catelog = ? AND (name LIKE ? OR url LIKE ? OR catelog LIKE ?) ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
                          countQuery = `SELECT COUNT(*) as total FROM sites WHERE catelog = ? AND (name LIKE ? OR url LIKE ? OR catelog LIKE ?)`;
                          queryBindParams = [catalog, likeKeyword, likeKeyword, likeKeyword, pageSize, offset];
                          countQueryParams = [catalog, likeKeyword, likeKeyword, likeKeyword];
                      }
                  }
  
                  const { results } = await env.NAV_DB.prepare(query).bind(...queryBindParams).all();
                  const countResult = await env.NAV_DB.prepare(countQuery).bind(...countQueryParams).first();
                  const total = countResult ? countResult.total : 0;
  
                return new Response(
                  JSON.stringify({
                      code: 200,
                      data: results,
                      total,
                      page,
                      pageSize
                  }),
                  { headers: { 'Content-Type': 'application/json' } }
              );
              
              } catch (e) {
                  return this.errorResponse(`Failed to fetch config data: ${e.message}`, 500)
              }
          },
        async getPendingConfig(request, env, ctx, url) {
            const page = parseInt(url.searchParams.get('page') || '1', 10);
            const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
            const offset = (page - 1) * pageSize;
            try {
                const { results } = await env.NAV_DB.prepare(`
                        SELECT * FROM pending_sites ORDER BY create_time DESC LIMIT ? OFFSET ?
                    `).bind(pageSize, offset).all();
                  const countResult = await env.NAV_DB.prepare(`
                      SELECT COUNT(*) as total FROM pending_sites
                      `).first();
                const total = countResult ? countResult.total : 0;
                  return new Response(
                      JSON.stringify({
                        code: 200,
                        data: results,
                          total,
                        page,
                        pageSize
                      }),
                      {headers: {'Content-Type': 'application/json'}}
                  );
            } catch (e) {
                return this.errorResponse(`Failed to fetch pending config data: ${e.message}`, 500);
            }
        },
        async approvePendingConfig(request, env, ctx, id) {
            try {
                const { results } = await env.NAV_DB.prepare('SELECT * FROM pending_sites WHERE id = ?').bind(id).all();
                if(results.length === 0) {
                    return this.errorResponse('Pending config not found', 404);
                }
                 const config = results[0];
                await this.ensureCatalogExists(env, config.catelog);
                
                await env.NAV_DB.prepare(`
                    INSERT INTO sites (name, url, logo, desc, catelog)
                    VALUES (?, ?, ?, ?, ?)
              `).bind(config.name, config.url, config.logo, config.desc, config.catelog).run();
                await env.NAV_DB.prepare('DELETE FROM pending_sites WHERE id = ?').bind(id).run();
  
                 return new Response(JSON.stringify({
                    code: 200,
                    message: 'Pending config approved successfully'
                }),{
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            }catch(e) {
                return this.errorResponse(`Failed to approve pending config : ${e.message}`, 500);
            }
        },
        async rejectPendingConfig(request, env, ctx, id) {
            try{
                await env.NAV_DB.prepare('DELETE FROM pending_sites WHERE id = ?').bind(id).run();
                return new Response(JSON.stringify({
                    code: 200,
                    message: 'Pending config rejected successfully',
                }), {headers: {'Content-Type': 'application/json'}});
            } catch(e) {
                return this.errorResponse(`Failed to reject pending config: ${e.message}`, 500);
            }
        },
      async submitConfig(request, env, ctx) {
          try{
              const config = await request.json();
              let { name, url, logo, desc, catelog } = config;
  
              if (!name || !url || !catelog ) {
                  return this.errorResponse('Name, URL and Catelog are required', 400);
              }

              if (!logo && url) {
                logo = await findFavicon(url);
              }

              await env.NAV_DB.prepare(`
                  INSERT INTO pending_sites (name, url, logo, desc, catelog)
                  VALUES (?, ?, ?, ?, ?)
            `).bind(name, url, logo, desc, catelog).run();
  
            return new Response(JSON.stringify({
              code: 201,
              message: 'Config submitted successfully, waiting for admin approve',
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            })
          } catch(e) {
              return this.errorResponse(`Failed to submit config : ${e.message}`, 500);
          }
      },
      
      async createConfig(request, env, ctx) {
          try{
              const config = await request.json();
              let { name, url, logo, desc, catelog } = config;
  
              if (!name || !url || !catelog ) {
                  return this.errorResponse('Name, URL and Catelog are required', 400);
              }

              if (!logo && url) {
                logo = await findFavicon(url);
              }
              
              await this.ensureCatalogExists(env, catelog);

              const maxOrderResult = await env.NAV_DB.prepare(`SELECT MAX(sort_order) as maxOrder FROM sites`).first();
              const newSortOrder = (maxOrderResult.maxOrder || 0) + 1;

              // 新增的書籤預設為公開 (is_private = 0)
              const insert = await env.NAV_DB.prepare(`
                    INSERT INTO sites (name, url, logo, desc, catelog, sort_order, is_private)
                    VALUES (?, ?, ?, ?, ?, ?, 0)
              `).bind(name, url, logo, desc, catelog, newSortOrder).run();
  
            return new Response(JSON.stringify({
              code: 201,
              message: 'Config created successfully',
              insert
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            })
          } catch(e) {
              if (e.message && e.message.includes('has no column named')) {
                  return this.errorResponse(`Database schema is outdated. Please run the ALTER TABLE commands. Error: ${e.message}`, 500);
              }
              return this.errorResponse(`Failed to create config : ${e.message}`, 500);
          }
      },
  
      async updateConfig(request, env, ctx, id) {
          try {
              const config = await request.json();
              const { name, url, logo, desc, catelog } = config;
              
              await this.ensureCatalogExists(env, catelog);
  
            const update = await env.NAV_DB.prepare(`
                UPDATE sites
                SET name = ?, url = ?, logo = ?, desc = ?, catelog = ?, update_time = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(name, url, logo, desc, catelog, id).run();
            return new Response(JSON.stringify({
                code: 200,
                message: 'Config updated successfully',
                update
            }), { headers: { 'Content-Type': 'application/json' }});
          } catch (e) {
              return this.errorResponse(`Failed to update config: ${e.message}`, 500);
          }
      },
      
      // --- [NEW] 切換書籤隱私狀態 ---
      async toggleSitePrivacy(request, env, ctx, siteId) {
          try {
              const site = await env.NAV_DB.prepare('SELECT is_private FROM sites WHERE id = ?').bind(siteId).first();
              if (!site) {
                  return this.errorResponse('Site not found', 404);
              }
              const newStatus = site.is_private === 0 ? 1 : 0;
              await env.NAV_DB.prepare('UPDATE sites SET is_private = ? WHERE id = ?').bind(newStatus, siteId).run();
              return new Response(JSON.stringify({ code: 200, message: 'Privacy status updated', newStatus: newStatus }), { headers: { 'Content-Type': 'application/json' }});
          } catch (e) {
              return this.errorResponse(`Failed to toggle site privacy: ${e.message}`, 500);
          }
      },

      async reorderConfig(request, env, ctx) {
        try {
            const { orderedIds } = await request.json();
            if (!Array.isArray(orderedIds)) {
                return this.errorResponse('Invalid data format, expected an array of IDs.', 400);
            }

            const statements = orderedIds.map((id, index) => {
                return env.NAV_DB.prepare('UPDATE sites SET sort_order = ? WHERE id = ?').bind(index + 1, id);
            });
            
            await env.NAV_DB.batch(statements);

            return new Response(JSON.stringify({
                code: 200,
                message: 'Reordered successfully'
            }), { headers: { 'Content-Type': 'application/json' }});

        } catch (e) {
            return this.errorResponse(`Failed to reorder configs: ${e.message}`, 500);
        }
      },
  
      async deleteConfig(request, env, ctx, id) {
          try{
              const del = await env.NAV_DB.prepare('DELETE FROM sites WHERE id = ?').bind(id).run();
              return new Response(JSON.stringify({
                  code: 200,
                  message: 'Config deleted successfully',
                  del
              }), {headers: {'Content-Type': 'application/json'}});
          } catch(e) {
            return this.errorResponse(`Failed to delete config: ${e.message}`, 500);
          }
      },

      async deleteAllConfigs(request, env, ctx) {
        try {
            await env.NAV_DB.prepare('DELETE FROM sites').run();
            await env.NAV_DB.prepare('DELETE FROM sqlite_sequence WHERE name="sites"').run();
            return new Response(JSON.stringify({
                code: 200,
                message: '所有書籤已成功刪除'
            }), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return this.errorResponse(`刪除所有書籤失敗: ${e.message}`, 500);
        }
      },

      async importConfig(request, env, ctx) {
        try {
          const jsonData = await request.json();
  
          if (!Array.isArray(jsonData)) {
            return this.errorResponse('Invalid JSON data. Must be an array of site configurations.', 400);
          }
          
          const uniqueCatalogs = [...new Set(jsonData.map(item => item.catelog))];
          for(const cat of uniqueCatalogs) {
              await this.ensureCatalogExists(env, cat);
          }
  
          const insertStatements = jsonData.map((item, index) =>
                env.NAV_DB.prepare(`
                        INSERT INTO sites (name, url, logo, desc, catelog, sort_order, is_private)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                  `).bind(item.name, item.url, item.logo, item.desc, item.catelog, item.sort_order || index + 1, item.is_private || 0)
            )
  
          await Promise.all(insertStatements.map(stmt => stmt.run()));
  
          return new Response(JSON.stringify({
              code: 201,
              message: 'Config imported successfully'
          }), {
              status: 201,
              headers: {'Content-Type': 'application/json'}
          });
        } catch (error) {
          return this.errorResponse(`Failed to import config : ${error.message}`, 500);
        }
      },
  
      async exportConfig(request, env, ctx) {
        try{
          const { results } = await env.NAV_DB.prepare('SELECT * FROM sites ORDER BY sort_order ASC').all();
          return new Response(JSON.stringify(results, null, 4),{
              headers: {
               'Content-Type': 'application/json',
                'Content-Disposition': 'attachment; filename="config.json"'
              }
          });
        } catch(e) {
          return this.errorResponse(`Failed to export config: ${e.message}`, 500)
        }
      },
      
      // --- [MODIFIED] 從 catalogs 表獲取所有分類供後台管理 ---
      async getCatalogs(request, env, ctx) {
        try {
            // [MODIFIED] 同时查询 icon 字段
            const { results } = await env.NAV_DB.prepare(
                `SELECT id, name, is_private, icon FROM catalogs ORDER BY sort_order ASC`
            ).all();
    
            return new Response(JSON.stringify({
                code: 200,
                data: results
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
    
        } catch (e) {
            return this.errorResponse(`Failed to fetch catalogs: ${e.message}`, 500);
        }
    },

    // [NEW] 创建新分类的函数
    async createCatalog(request, env, ctx) {
        try {
            const { name, icon } = await request.json();
            if (!name) {
                return this.errorResponse('Catalog name is required', 400);
            }
            const maxOrderResult = await env.NAV_DB.prepare(`SELECT MAX(sort_order) as maxOrder FROM catalogs`).first();
            const newSortOrder = (maxOrderResult.maxOrder || 0) + 1;

            await env.NAV_DB.prepare(
                'INSERT INTO catalogs (name, icon, sort_order, is_private) VALUES (?, ?, ?, 0)'
            ).bind(name, icon || null, newSortOrder).run();

            return new Response(JSON.stringify({ code: 201, message: 'Catalog created successfully' }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return this.errorResponse(`Failed to create catalog: ${e.message}`, 500);
        }
    },

    async updateCatalog(request, env, ctx) {
        try {
            // [MODIFIED] 更新逻辑，使其支持更新名称和图标，并通过 ID 定位
            const { id, oldName, newName, icon } = await request.json();
            if (!id || !oldName || !newName) {
                return this.errorResponse('ID, old name, and new name are required', 400);
            }

            const statements = [
                env.NAV_DB.prepare('UPDATE catalogs SET name = ?, icon = ? WHERE id = ?').bind(newName, icon, id)
            ];

            // 如果分类名称发生变化，需要同步更新所有关联的书签
            if (oldName !== newName) {
                statements.push(env.NAV_DB.prepare('UPDATE sites SET catelog = ? WHERE catelog = ?').bind(newName, oldName));
            }
            
            await env.NAV_DB.batch(statements);
            
            return new Response(JSON.stringify({ code: 200, message: 'Catalog updated successfully' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return this.errorResponse(`Failed to update catalog: ${e.message}`, 500);
        }
    },

    async deleteCatalog(request, env, ctx) {
        try {
            const { name } = await request.json();
            if (!name) {
                return this.errorResponse('Catalog name is required', 400);
            }
            await env.NAV_DB.batch([
                env.NAV_DB.prepare('DELETE FROM sites WHERE catelog = ?').bind(name),
                env.NAV_DB.prepare('DELETE FROM catalogs WHERE name = ?').bind(name)
            ]);
            return new Response(JSON.stringify({ code: 200, message: 'Catalog and all associated sites deleted successfully' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return this.errorResponse(`Failed to delete catalog: ${e.message}`, 500);
        }
    },
    
    // --- [NEW] 切換分類隱私狀態 ---
    async toggleCatalogPrivacy(request, env, ctx, catalogId) {
        try {
            const catalog = await env.NAV_DB.prepare('SELECT is_private FROM catalogs WHERE id = ?').bind(catalogId).first();
            if (!catalog) {
                return this.errorResponse('Catalog not found', 404);
            }
            const newStatus = catalog.is_private === 0 ? 1 : 0;
            await env.NAV_DB.prepare('UPDATE catalogs SET is_private = ? WHERE id = ?').bind(newStatus, catalogId).run();
            return new Response(JSON.stringify({ code: 200, message: 'Privacy status updated', newStatus: newStatus }), { headers: { 'Content-Type': 'application/json' }});
        } catch (e) {
            return this.errorResponse(`Failed to toggle catalog privacy: ${e.message}`, 500);
        }
    },

    async reorderCatalogs(request, env, ctx) {
        try {
            const { orderedNames } = await request.json();
            if (!Array.isArray(orderedNames)) {
                return this.errorResponse('Invalid data format, expected an array of names.', 400);
            }

            const statements = orderedNames.map((name, index) => {
                return env.NAV_DB.prepare('UPDATE catalogs SET sort_order = ? WHERE name = ?').bind(index + 1, name);
            });
            
            await env.NAV_DB.batch(statements);

            return new Response(JSON.stringify({
                code: 200,
                message: 'Catalogs reordered successfully'
            }), { headers: { 'Content-Type': 'application/json' }});
        } catch (e) {
            return this.errorResponse(`Failed to reorder catalogs: ${e.message}`, 500);
        }
    },

    async migrateCatalogs(request, env, ctx) {
        try {
            const { results } = await env.NAV_DB.prepare(
                `SELECT DISTINCT catelog FROM sites WHERE catelog IS NOT NULL AND catelog != '' ORDER BY catelog`
            ).all();

            if (!results || results.length === 0) {
                return new Response(JSON.stringify({ code: 200, message: 'No catalogs to migrate.' }), { headers: { 'Content-Type': 'application/json' } });
            }

            const statements = results.map((row, index) => {
                return env.NAV_DB.prepare(
                    'INSERT OR IGNORE INTO catalogs (name, sort_order) VALUES (?, ?)'
                ).bind(row.catelog, index + 1);
            });

            await env.NAV_DB.batch(statements);

            return new Response(JSON.stringify({
                code: 200,
                message: `Successfully migrated ${results.length} catalogs.`
            }), { headers: { 'Content-Type': 'application/json' } });

        } catch (e) {
            return this.errorResponse(`Failed to migrate catalogs: ${e.message}`, 500);
        }
    },
    
    async ensureCatalogExists(env, catalogName) {
        if (!catalogName) return;
        try {
            const maxOrderResult = await env.NAV_DB.prepare(`SELECT MAX(sort_order) as maxOrder FROM catalogs`).first();
            const newSortOrder = (maxOrderResult.maxOrder || 0) + 1;
            
            // 新增的分類預設為公開 (is_private = 0)
            await env.NAV_DB.prepare(
                'INSERT OR IGNORE INTO catalogs (name, sort_order, is_private) VALUES (?, ?, 0)'
            ).bind(catalogName, newSortOrder).run();
        } catch (e) {
            if (e.message && e.message.includes('no such table: catalogs')) {
                console.warn('Catalogs table does not exist. Skipping catalog creation.');
            } else {
                throw e;
            }
        }
    },

    errorResponse(message, status) {
        return new Response(JSON.stringify({code: status, message: message}), {
            status: status,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    };
  
  
  /**
   * 处理后台管理页面请求
   */
  const admin = {
  async handleRequest(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/admin') {
      const params = url.searchParams;
      const name = params.get('name');
      const password = params.get('password');

    const storedUsername = await env.NAV_AUTH.get("admin_username");
    const storedPassword = await env.NAV_AUTH.get("admin_password");

    if (name === storedUsername && password === storedPassword) {
      return this.renderAdminPage();
    } else if (name || password) {
      return new Response('未授权访问', {
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    } else {
      return this.renderLoginPage();
    }
    }
    
    if (url.pathname.startsWith('/static')) {
      return this.handleStatic(request, env, ctx);
    }
    
    return new Response('页面不存在', {status: 404});
  },
     async handleStatic(request, env, ctx) {
        const url = new URL(request.url);
        const filePath = url.pathname.replace('/static/', '');
  
        let contentType = 'text/plain';
        if (filePath.endsWith('.css')) {
           contentType = 'text/css';
        } else if (filePath.endsWith('.js')) {
           contentType = 'application/javascript';
        }
  
        try {
            const fileContent = await this.getFileContent(filePath)
            return new Response(fileContent, {
              headers: { 'Content-Type': contentType }
            });
        } catch (e) {
           return new Response('Not Found', {status: 404});
        }
  
      },
    async getFileContent(filePath) {
        const fileContents = {
           'admin.html': `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>书签目录</title>
      <link rel="stylesheet" href="/static/admin.css">
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    </head>
    <body>
      <div class="container">
          <h1></h1>
      
          <div class="import-export">
            <input type="file" id="importFile" accept=".json" style="display:none;">
            <button id="importBtn">导入</button>
            <button id="exportBtn">導出</button>
            <button id="deleteAllBtn" class="del-all-btn">一鍵刪除所有書籤</button>
          </div>
      
          <div class="add-new">
            <input type="text" id="addName" placeholder="Name">
            <input type="text" id="addUrl" placeholder="URL">
            <input type="text" id="addLogo" placeholder="Logo(optional)">
             <input type="text" id="addDesc" placeholder="Description(optional)">
            <input type="text" id="addCatelog" placeholder="选择或创建分类" list="catalogDataList">
            <button id="addBtn">添加</button>
          </div>
          <div id="message" style="display: none;padding:1rem;border-radius: 0.5rem;margin-bottom: 1rem;"></div>
         <div class="tab-wrapper">
              <div class="tab-buttons">
                 <button class="tab-button active" data-tab="config">书签列表</button>
                 <button class="tab-button" data-tab="pending">待审核列表</button>
                 <button class="tab-button" data-tab="catalogs">分类列表</button>
              </div>
               <div id="config" class="tab-content active">
                    <div class="table-wrapper">
                        <div style="padding: 5px; color: #666; font-size: 0.9em;">提示：您可以直接拖曳表格行來調整書籤順序。</div>
                        <table id="configTable">
                            <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Name</th>
                                  <th>URL</th>
                                  <th>Logo</th>
                                  <th>Description</th>
                                  <th>Catelog</th>
                                  <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="configTableBody">
                            </tbody>
                        </table>
                        <div class="pagination">
                              <button id="prevPage" disabled>上一页</button>
                              <span id="currentPage">1</span>/<span id="totalPages">1</span>
                              <button id="nextPage" disabled>下一页</button>
                        </div>
                   </div>
                </div>
               <div id="pending" class="tab-content">
                 <div class="table-wrapper">
                   <table id="pendingTable">
                      <thead>
                        <tr>
                            <th>ID</th>
                             <th>Name</th>
                             <th>URL</th>
                            <th>Logo</th>
                            <th>Description</th>
                            <th>Catelog</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody id="pendingTableBody">
                        </tbody>
                    </table>
                     <div class="pagination">
                      <button id="pendingPrevPage" disabled>上一页</button>
                       <span id="pendingCurrentPage">1</span>/<span id="pendingTotalPages">1</span>
                      <button id="pendingNextPage" disabled>下一页</button>
                    </div>
                 </div>
               </div>
               <div id="catalogs" class="tab-content">
                <div class="table-wrapper">
                  <div style="padding: 5px; color: #666; font-size: 0.9em;">提示：您可以直接拖曳表格行來調整分類順序。</div>
                  <button id="migrateCatalogsBtn" style="margin-bottom: 10px;">遷移舊分類到新系統</button>
                  <button id="addCatalogBtn" style="margin-bottom: 10px; margin-left: 10px;">增加分类</button>
                  <table id="catalogTable">
                     <thead>
                       <tr>
                           <th>图标</th>
                           <th>分类名称</th>
                           <th>Actions</th>
                       </tr>
                       </thead>
                       <tbody id="catalogTableBody">
                       </tbody>
                   </table>
                </div>
              </div>
            </div>
      </div>
      <datalist id="catalogDataList"></datalist>
      <script src="/static/admin.js"></script>
    </body>
    </html>`,
            'admin.css': `body {
        font-family: 'Noto Sans SC', sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f8f9fa;
        color: #212529;
    }
    #configTableBody tr, #catalogTableBody tr {
        cursor: move;
    }
    .sortable-ghost {
        opacity: 0.4;
        background-color: #cde4ff;
    }
    .sortable-drag {
        background-color: #eef;
    }
    .privacy-toggle-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        font-size: 1.2rem;
        line-height: 1;
    }
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5);
    }
    .modal-content {
        background-color: #fff;
        margin: 10% auto;
        padding: 20px;
        border: 1px solid #dee2e6;
        width: 60%;
        border-radius: 8px;
        position: relative;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .modal-close {
        color: #6c757d;
        position: absolute;
        right: 10px;
        top: 0;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        transition: color 0.2s;
    }
    
    .modal-close:hover,
    .modal-close:focus {
        color: #343a40;
        text-decoration: none;
        cursor: pointer;
    }
    .modal-content form {
        display: flex;
        flex-direction: column;
    }
    
    .modal-content form label {
        margin-bottom: 5px;
        font-weight: 500;
        color: #495057;
    }
    .modal-content form input {
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
    }
    .modal-content form input:focus {
        border-color: #80bdff;
        box-shadow:0 0 0 0.2rem rgba(0,123,255,.25);
    }
    .modal-content form input:focus {
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }
    .modal-content button[type='submit'] {
        margin-top: 10px;
        background-color: #007bff;
        color: #fff;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }
    
    .modal-content button[type='submit']:hover {
        background-color: #0056b3;
    }
    .container {
        max-width: 1200px;
        margin: 20px auto;
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
        text-align: center;
        margin-bottom: 20px;
        color: #343a40;
    }
    .tab-wrapper {
        margin-top: 20px;
    }
    .tab-buttons {
        display: flex;
        margin-bottom: 10px;
    }
    .tab-button {
        background-color: #e9ecef;
        border: 1px solid #dee2e6;
        padding: 10px 15px;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        color: #495057;
        transition: background-color 0.2s, color 0.2s;
    }
    .tab-button.active {
        background-color: #fff;
        border-bottom: 1px solid #fff;
        color: #212529;
    }
    .tab-button:hover {
        background-color: #f0f0f0;
    }
    .tab-content {
        display: none;
        border: 1px solid #dee2e6;
        padding: 10px;
        border-top: none;
    }
    .tab-content.active {
        display: block;
    }
    
    .import-export {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        justify-content: flex-end;
    }
    
    .add-new {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }
    .add-new > input {
        flex: 1;
    }
    input[type="text"] {
        padding: 10px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 1rem;
        outline: none;
        margin-bottom: 5px;
         transition: border-color 0.2s;
    }
    input[type="text"]:focus {
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }
    button {
        background-color: #6c63ff;
        color: #fff;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }
    button:hover {
        background-color: #534dc4;
    }
    
    .table-wrapper {
        overflow-x: auto;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }
    th, td {
        border: 1px solid #dee2e6;
        padding: 10px;
        text-align: left;
        color: #495057;
    }
    th {
        background-color: #f2f2f2;
        font-weight: 600;
    }
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    
    .actions {
        display: flex;
        gap: 5px;
        align-items: center;
    }
    .actions button:not(.privacy-toggle-btn) {
        padding: 5px 8px;
        font-size: 0.8rem;
    }
    .edit-btn {
        background-color: #17a2b8;
    }
    
    .del-btn {
        background-color: #dc3545;
    }
    .pagination {
        text-align: center;
        margin-top: 20px;
    }
    .pagination button {
        margin: 0 5px;
        background-color: #e9ecef;
        color: #495057;
        border: 1px solid #ced4da;
    }
    .pagination button:hover {
        background-color: #dee2e6;
    }
    
    .success {
        background-color: #28a745;
        color: #fff;
    }
    .error {
        background-color: #dc3545;
        color: #fff;
    }
    .del-all-btn {
        background-color: #dc3545;
    }
    .del-all-btn:hover {
        background-color: #c82333;
    }
      `,
          'admin.js': `
          const configTableBody = document.getElementById('configTableBody');
          const prevPageBtn = document.getElementById('prevPage');
          const nextPageBtn = document.getElementById('nextPage');
          const currentPageSpan = document.getElementById('currentPage');
          const totalPagesSpan = document.getElementById('totalPages');
          
          const pendingTableBody = document.getElementById('pendingTableBody');
          const pendingPrevPageBtn = document.getElementById('pendingPrevPage');
          const pendingNextPageBtn = document.getElementById('pendingNextPage');
          const pendingCurrentPageSpan = document.getElementById('pendingCurrentPage');
          const pendingTotalPagesSpan = document.getElementById('pendingTotalPages');

          const catalogTableBody = document.getElementById('catalogTableBody');
          
          const messageDiv = document.getElementById('message');
          
          const addBtn = document.getElementById('addBtn');
          const addName = document.getElementById('addName');
          const addUrl = document.getElementById('addUrl');
          const addLogo = document.getElementById('addLogo');
          const addDesc = document.getElementById('addDesc');
          const addCatelog = document.getElementById('addCatelog');
          
          const importBtn = document.getElementById('importBtn');
          const importFile = document.getElementById('importFile');
          const exportBtn = document.getElementById('exportBtn');
          const deleteAllBtn = document.getElementById('deleteAllBtn');
          const migrateCatalogsBtn = document.getElementById('migrateCatalogsBtn');
          
           const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
          
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                tabButtons.forEach(b => b.classList.remove('active'));
                 button.classList.add('active');
                tabContents.forEach(content => {
                   content.classList.remove('active');
                    if(content.id === tab) {
                       content.classList.add('active');
                     }
                  })
              });
            });
          
          const searchInput = document.createElement('input');
          searchInput.type = 'text';
          searchInput.placeholder = '搜索书签(名称，URL，分类)';
          searchInput.id = 'searchInput';
          searchInput.style.marginBottom = '10px';
          document.querySelector('.add-new').parentNode.insertBefore(searchInput, document.querySelector('.add-new'));
          
          let currentPage = 1;
          let pageSize = 10;
          let totalItems = 0;
          let allConfigs = [];
          let currentSearchKeyword = '';
          
          let pendingCurrentPage = 1;
            let pendingPageSize = 10;
            let pendingTotalItems = 0;
            let allPendingConfigs = [];
          
          const editModal = document.createElement('div');
          editModal.className = 'modal';
          editModal.style.display = 'none';
          editModal.innerHTML = \`
            <div class="modal-content">
              <span class="modal-close">×</span>
              <h2>编辑站点</h2>
              <form id="editForm">
                <input type="hidden" id="editId">
                <label for="editName">名称:</label>
                <input type="text" id="editName" required><br>
                <label for="editUrl">URL:</label>
                <input type="text" id="editUrl" required><br>
                <label for="editLogo">Logo(可选):</label>
                <input type="text" id="editLogo"><br>
                <label for="editDesc">描述(可选):</label>
                <input type="text" id="editDesc"><br>
                <label for="editCatelog">分类:</label>
                <input type="text" id="editCatelog" required list="catalogDataList"><br>
                <button type="submit">保存</button>
              </form>
            </div>
          \`;
          document.body.appendChild(editModal);

          // [NEW] 增加一个用于编辑分类的模态框
          const editCatalogModal = document.createElement('div');
          editCatalogModal.className = 'modal';
          editCatalogModal.style.display = 'none';
          editCatalogModal.innerHTML = \`
            <div class="modal-content">
              <span class="modal-close" id="editCatalogModalClose">×</span>
              <h2 id="catalogModalTitle">编辑分类</h2>
              <form id="editCatalogForm">
                <input type="hidden" id="editCatalogId">
                <input type="hidden" id="editCatalogOldName">
                <label for="editCatalogName">分类名称:</label>
                <input type="text" id="editCatalogName" required><br>
                <label for="editCatalogIcon">分类图标 (URL):</label>
                <input type="text" id="editCatalogIcon" placeholder="https://.../icon.png"><br>
                <button type="submit">保存</button>
              </form>
            </div>
          \`;
          document.body.appendChild(editCatalogModal);
          
          const modalClose = editModal.querySelector('.modal-close');
          modalClose.addEventListener('click', () => {
            editModal.style.display = 'none';
          });
          
          const editForm = document.getElementById('editForm');
          editForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const id = document.getElementById('editId').value;
            const name = document.getElementById('editName').value;
            const url = document.getElementById('editUrl').value;
            const logo = document.getElementById('editLogo').value;
            const desc = document.getElementById('editDesc').value;
            const catelog = document.getElementById('editCatelog').value;
          
            fetch(\`/api/config/\${id}\`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, url, logo, desc, catelog })
            }).then(res => res.json())
              .then(data => {
                if (data.code === 200) {
                  showMessage('修改成功', 'success');
                  fetchConfigs();
                  fetchAndPopulateCatalogs();
                  editModal.style.display = 'none';
                } else {
                  showMessage(data.message, 'error');
                }
              }).catch(err => {
                showMessage('网络错误', 'error');
              })
          });
          
          function fetchConfigs(page = currentPage, keyword = currentSearchKeyword) {
              let url = keyword ? \`/api/config?pageSize=999&keyword=\${keyword}\` : \`/api/config?page=\${page}&pageSize=\${pageSize}\`;
              
              fetch(url)
                  .then(res => res.json())
                  .then(data => {
                      if (data.code === 200) {
                          totalItems = data.total;
                          currentPage = data.page;
                          totalPagesSpan.innerText = Math.ceil(totalItems / pageSize) || 1;
                          currentPageSpan.innerText = currentPage;
                          allConfigs = data.data;
                          renderConfig(allConfigs);
                          updatePaginationButtons();
                          document.querySelector('#config .pagination').style.display = keyword ? 'none' : 'block';
                      } else {
                          showMessage(data.message, 'error');
                      }
                  }).catch(err => {
                  showMessage('网络错误', 'error');
              })
          }
          function renderConfig(configs) {
          configTableBody.innerHTML = '';
           if (configs.length === 0) {
                configTableBody.innerHTML = '<tr><td colspan="7">没有配置数据</td></tr>';
                return
            }
          configs.forEach(config => {
              const row = document.createElement('tr');
              row.dataset.id = config.id;
              const privacyIcon = config.is_private === 1 ? '🔒' : '🔓';
               row.innerHTML = \`
                 <td>\${config.id}</td>
                  <td>\${config.name}</td>
                  <td><a href="\${config.url}" target="_blank">\${config.url}</a></td>
                  <td>\${config.logo ? \`<img src="\${config.logo}" style="width:30px;" />\` : 'N/A'}</td>
                  <td>\${config.desc || 'N/A'}</td>
                  <td>\${config.catelog}</td>
                  <td class="actions">
                    <button class="privacy-toggle-btn site-privacy-toggle" title="切換隱私狀態" data-id="\${config.id}" data-status="\${config.is_private}">\${privacyIcon}</button>
                    <button class="edit-btn" data-id="\${config.id}">编辑</button>
                    <button class="del-btn" data-id="\${config.id}">删除</button>
                  </td>
               \`;
              configTableBody.appendChild(row);
          });
            bindActionEvents();
          }
          
          function bindActionEvents() {
           document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.dataset.id;
                    handleEdit(id);
                })
           });
          
          document.querySelectorAll('.del-btn').forEach(btn => {
               btn.addEventListener('click', function() {
                  const id = this.dataset.id;
                   handleDelete(id)
               })
          });
          
          // --- [NEW] 绑定書籤隐私切换事件 ---
          document.querySelectorAll('.site-privacy-toggle').forEach(btn => {
              btn.addEventListener('click', function() {
                  const id = this.dataset.id;
                  handleToggleSitePrivacy(id, this);
              });
          });
          }
          
          function handleEdit(id) {
            const row = document.querySelector(\`tr[data-id="\${id}"]\`);
            if (!row) return showMessage('找不到数据','error');
            const name = row.querySelector('td:nth-child(2)').innerText;
            const url = row.querySelector('td:nth-child(3) a').innerText;
            const logo = row.querySelector('td:nth-child(4) img')?.src || '';
            const desc = row.querySelector('td:nth-child(5)').innerText === 'N/A' ? '' : row.querySelector('td:nth-child(5)').innerText;
            const catelog = row.querySelector('td:nth-child(6)').innerText;
          
            document.getElementById('editId').value = id;
            document.getElementById('editName').value = name;
            document.getElementById('editUrl').value = url;
            document.getElementById('editLogo').value = logo;
            document.getElementById('editDesc').value = desc;
            document.getElementById('editCatelog').value = catelog;
            editModal.style.display = 'block';
          }
          function handleDelete(id) {
            if(!confirm('确认删除？')) return;
             fetch(\`/api/config/\${id}\`, {
                  method: 'DELETE'
              }).then(res => res.json())
                 .then(data => {
                     if (data.code === 200) {
                         showMessage('删除成功', 'success');
                         fetchConfigs();
                     } else {
                         showMessage(data.message, 'error');
                     }
                 }).catch(err => {
                      showMessage('网络错误', 'error');
                 })
          }

          // --- [NEW] 處理書籤隐私切换 ---
          function handleToggleSitePrivacy(id, buttonElement) {
              fetch(\`/api/config/\${id}/toggle_privacy\`, { method: 'PUT' })
                  .then(res => res.json())
                  .then(data => {
                      if (data.code === 200) {
                          buttonElement.dataset.status = data.newStatus;
                          buttonElement.innerHTML = data.newStatus === 1 ? '🔒' : '🔓';
                          showMessage('状态已更新', 'success');
                      } else {
                          showMessage(data.message, 'error');
                      }
                  }).catch(err => showMessage('网络错误', 'error'));
          }
          
          function showMessage(message, type) {
            messageDiv.innerText = message;
            messageDiv.className = type;
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
          }
          
          function fetchAndPopulateCatalogs() {
              const dataList = document.getElementById('catalogDataList');
              if (!dataList) return;
  
              fetch('/api/catalogs')
                  .then(res => res.json())
                  .then(data => {
                      // [MODIFIED] API现在返回对象数组
                      if (data.code === 200 && Array.isArray(data.data)) {
                          dataList.innerHTML = '';
                          data.data.forEach(catalog => {
                              const option = document.createElement('option');
                              option.value = catalog.name; // 只使用 name
                              dataList.appendChild(option);
                          });
                      }
                  })
                  .catch(err => console.error('Failed to load catalogs:', err));
          }

          function updatePaginationButtons() {
            prevPageBtn.disabled = currentPage === 1;
             nextPageBtn.disabled = currentPage >= Math.ceil(totalItems/pageSize)
          }
          
          prevPageBtn.addEventListener('click', () => {
          if(currentPage > 1) {
              fetchConfigs(currentPage -1);
          }
          });
          nextPageBtn.addEventListener('click', () => {
            if (currentPage < Math.ceil(totalItems/pageSize)) {
              fetchConfigs(currentPage + 1);
            }
          });
          
          addBtn.addEventListener('click', () => {
            const name = addName.value;
            const url = addUrl.value;
            const logo = addLogo.value;
            const desc = addDesc.value;
             const catelog = addCatelog.value;
            if(!name ||    !url || !catelog) {
              showMessage('名称,URL,分类 必填', 'error');
              return;
          }
          fetch('/api/config', { method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, url, logo, desc, catelog })
          }).then(res => res.json())
          .then(data => {
             if(data.code === 201) {
                 showMessage('添加成功', 'success');
                addName.value = '';
                addUrl.value = '';
                addLogo.value = '';
                addDesc.value = '';
                 addCatelog.value = '';
                 fetchConfigs();
                 fetchAndPopulateCatalogs();
                 fetchCatalogs();
             }else {
                showMessage(data.message, 'error');
             }
          }).catch(err => {
            showMessage('网络错误', 'error');
          })
          });
          
          importBtn.addEventListener('click', () => {
          importFile.click();
          });
          importFile.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (file) {
           const reader = new FileReader();
          reader.onload = function(event) {
             try {
                 const jsonData = JSON.parse(event.target.result);
                   fetch('/api/config/import', {
                       method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify(jsonData)
                  }).then(res => res.json())
                     .then(data => {
                          if(data.code === 201) {
                             showMessage('导入成功', 'success');
                              fetchConfigs();
                              fetchCatalogs();
                          } else {
                             showMessage(data.message, 'error');
                          }
                     }).catch(err => {
                           showMessage('网络错误', 'error');
                  })
          
             } catch (error) {
                   showMessage('JSON格式不正确', 'error');
             }
          }
           reader.readAsText(file);
          }
          })
          exportBtn.addEventListener('click', () => {
          fetch('/api/config/export')
          .then(res => res.blob())
          .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'config.json';
          document.body.appendChild(a);
          a.click();
           window.URL.revokeObjectURL(url);
           document.body.removeChild(a);
          }).catch(err => {
          showMessage('网络错误', 'error');
          })
          })
          
          searchInput.addEventListener('input', () => {
              currentSearchKeyword = searchInput.value.trim();
              currentPage = 1;
              fetchConfigs(currentPage,currentSearchKeyword);
          });
          
          function fetchPendingConfigs(page = pendingCurrentPage) {
                  fetch(\`/api/pending?page=\${page}&pageSize=\${pendingPageSize}\`)
                      .then(res => res.json())
                      .then(data => {
                        if (data.code === 200) {
                               pendingTotalItems = data.total;
                               pendingCurrentPage = data.page;
                               pendingTotalPagesSpan.innerText = Math.ceil(pendingTotalItems/ pendingPageSize) || 1;
                                pendingCurrentPageSpan.innerText = pendingCurrentPage;
                               allPendingConfigs = data.data;
                                 renderPendingConfig(allPendingConfigs);
                                updatePendingPaginationButtons();
                        } else {
                            showMessage(data.message, 'error');
                        }
                      }).catch(err => {
                      showMessage('网络错误', 'error');
                   })
          }
          
            function renderPendingConfig(configs) {
                  pendingTableBody.innerHTML = '';
                  if(configs.length === 0) {
                      pendingTableBody.innerHTML = '<tr><td colspan="7">没有待审核数据</td></tr>';
                      return
                  }
                configs.forEach(config => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                      <td>\${config.id}</td>
                       <td>\${config.name}</td>
                       <td><a href="\${config.url}" target="_blank">\${config.url}</a></td>
                       <td>\${config.logo ? \`<img src="\${config.logo}" style="width:30px;" />\` : 'N/A'}</td>
                       <td>\${config.desc || 'N/A'}</td>
                       <td>\${config.catelog}</td>
                        <td class="actions">
                            <button class="approve-btn" data-id="\${config.id}">批准</button>
                          <button class="reject-btn" data-id="\${config.id}">拒绝</button>
                        </td>
                      \`;
                    pendingTableBody.appendChild(row);
                });
                bindPendingActionEvents();
            }
           function bindPendingActionEvents() {
               document.querySelectorAll('.approve-btn').forEach(btn => {
                   btn.addEventListener('click', function() {
                       const id = this.dataset.id;
                       handleApprove(id);
                   })
               });
              document.querySelectorAll('.reject-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                         const id = this.dataset.id;
                         handleReject(id);
                     })
              })
           }
          
          function handleApprove(id) {
             if (!confirm('确定批准吗？')) return;
             fetch(\`/api/pending/\${id}\`, {
                   method: 'PUT',
                 }).then(res => res.json())
               .then(data => {
                    if (data.code === 200) {
                        showMessage('批准成功', 'success');
                        fetchPendingConfigs();
                         fetchConfigs();
                         fetchAndPopulateCatalogs();
                         fetchCatalogs();
                    } else {
                         showMessage(data.message, 'error')
                     }
                }).catch(err => {
                      showMessage('网络错误', 'error');
                  })
          }
           function handleReject(id) {
               if (!confirm('确定拒绝吗？')) return;
              fetch(\`/api/pending/\${id}\`, {
                     method: 'DELETE'
                }).then(res => res.json())
                   .then(data => {
                     if(data.code === 200) {
                         showMessage('拒绝成功', 'success');
                        fetchPendingConfigs();
                    } else {
                       showMessage(data.message, 'error');
                   }
                  }).catch(err => {
                        showMessage('网络错误', 'error');
                })
           }
          function updatePendingPaginationButtons() {
              pendingPrevPageBtn.disabled = pendingCurrentPage === 1;
               pendingNextPageBtn.disabled = pendingCurrentPage >= Math.ceil(pendingTotalItems/ pendingPageSize)
           }
          
           pendingPrevPageBtn.addEventListener('click', () => {
               if (pendingCurrentPage > 1) {
                   fetchPendingConfigs(pendingCurrentPage - 1);
               }
           });
            pendingNextPageBtn.addEventListener('click', () => {
               if (pendingCurrentPage < Math.ceil(pendingTotalItems/pendingPageSize)) {
                   fetchPendingConfigs(pendingCurrentPage + 1)
               }
            });
          
          // --- 分类列表相关功能 ---
          function fetchCatalogs() {
            fetch('/api/catalogs')
              .then(res => res.json())
              .then(data => {
                if (data.code === 200 && Array.isArray(data.data)) {
                  renderCatalogs(data.data);
                } else {
                  showMessage(data.message, 'error');
                }
              })
              .catch(err => showMessage('获取分类列表失败', 'error'));
          }

          function renderCatalogs(catalogs) {
            catalogTableBody.innerHTML = '';
            if (catalogs.length === 0) {
              // [MODIFIED] 调整 colspan
              catalogTableBody.innerHTML = '<tr><td colspan="3">没有分类数据，请尝试迁移旧分类。</td></tr>';
              return;
            }
            catalogs.forEach(cat => {
              const row = document.createElement('tr');
              row.dataset.id = cat.id; 
              row.dataset.name = cat.name;
              const privacyIcon = cat.is_private === 1 ? '🔒' : '🔓';
              // [MODIFIED] 增加图标列的 HTML
              row.innerHTML = \`
                <td>\${cat.icon ? \`<img src="\${cat.icon}" style="width:30px; height: 30px; object-fit: cover; border-radius: 4px;" />\` : 'N/A'}</td>
                <td><a href="#" class="catalog-link" data-catalog-name="\${cat.name}" style="color: #007bff; text-decoration: underline; cursor: pointer;">\${cat.name}</a></td>
                <td class="actions">
                  <button class="privacy-toggle-btn catalog-privacy-toggle" title="切換隱私狀態" data-id="\${cat.id}" data-status="\${cat.is_private}">\${privacyIcon}</button>
                  <button class="edit-cat-btn" data-catalog='\${JSON.stringify(cat)}'>编辑</button>
                  <button class="del-cat-btn" data-name="\${cat.name}">删除</button>
                </td>
              \`;
              catalogTableBody.appendChild(row);
            });
            bindCatalogActionEvents();
          }

          function bindCatalogActionEvents() {
            document.querySelectorAll('.edit-cat-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                // [MODIFIED] 解析整个 catalog 对象
                const catalog = JSON.parse(this.dataset.catalog);
                handleEditCatalog(catalog);
              });
            });

            document.querySelectorAll('.del-cat-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                const name = this.dataset.name;
                handleDeleteCatalog(name);
              });
            });
            
            document.querySelectorAll('.catalog-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const catalogName = this.dataset.catalogName;
                    document.querySelector('.tab-button[data-tab="config"]').click();
                    const searchInput = document.getElementById('searchInput');
                    searchInput.value = catalogName;
                    currentSearchKeyword = catalogName.trim();
                    currentPage = 1;
                    fetchConfigs(currentPage, currentSearchKeyword);
                });
            });

            document.querySelectorAll('.catalog-privacy-toggle').forEach(btn => {
              btn.addEventListener('click', function() {
                  const id = this.dataset.id;
                  handleToggleCatalogPrivacy(id, this);
              });
            });
          }
          
          // [MODIFIED] handleEditCatalog 函数，使用模态框
          function handleEditCatalog(catalog) {
            // 如果 catalog 为 null, 表示是“新增”操作
            const isNew = !catalog;
            document.getElementById('catalogModalTitle').innerText = isNew ? '增加新分类' : '编辑分类';
            document.getElementById('editCatalogId').value = isNew ? '' : catalog.id;
            document.getElementById('editCatalogOldName').value = isNew ? '' : catalog.name;
            document.getElementById('editCatalogName').value = isNew ? '' : catalog.name;
            document.getElementById('editCatalogIcon').value = isNew ? '' : (catalog.icon || '');
            
            editCatalogModal.style.display = 'block';
          }

          function handleDeleteCatalog(name) {
            if (confirm(\`【警告】确定要删除分类 "\${name}" 吗？这将同时删除该分类下的所有书签！此操作无法恢复！\`)) {
              fetch('/api/catalogs', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
              }).then(res => res.json())
                .then(data => {
                  if (data.code === 200) {
                    showMessage('分类及相关书签已删除', 'success');
                    fetchCatalogs();
                    fetchConfigs();
                    fetchAndPopulateCatalogs();
                  } else {
                    showMessage(data.message, 'error');
                  }
                }).catch(err => showMessage('删除失败', 'error'));
            }
          }
          
          function handleToggleCatalogPrivacy(id, buttonElement) {
              fetch(\`/api/catalogs/\${id}/toggle_privacy\`, { method: 'PUT' })
                  .then(res => res.json())
                  .then(data => {
                      if (data.code === 200) {
                          buttonElement.dataset.status = data.newStatus;
                          buttonElement.innerHTML = data.newStatus === 1 ? '🔒' : '🔓';
                          showMessage('状态已更新', 'success');
                      } else {
                          showMessage(data.message, 'error');
                      }
                  }).catch(err => showMessage('网络错误', 'error'));
          }

          function initSortable() {
              if (window.sortableInstance) window.sortableInstance.destroy();
              window.sortableInstance = new Sortable(configTableBody, {
                  animation: 150,
                  ghostClass: 'sortable-ghost',
                  dragClass: 'sortable-drag',
                  onEnd: function (evt) {
                      const orderedIds = Array.from(configTableBody.children).map(row => row.dataset.id);
                      fetch('/api/config/reorder', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderedIds })
                      }).then(res => res.json())
                        .then(data => {
                            if (data.code === 200) {
                                showMessage('排序已更新', 'success');
                                fetchConfigs(currentPage, currentSearchKeyword);
                            } else {
                                showMessage(data.message, 'error');
                            }
                        }).catch(err => showMessage('更新排序失败', 'error'));
                  },
              });
          }
          
          function initSortableCatalogs() {
              if (window.sortableCatalogsInstance) window.sortableCatalogsInstance.destroy();
              window.sortableCatalogsInstance = new Sortable(catalogTableBody, {
                  animation: 150,
                  ghostClass: 'sortable-ghost',
                  dragClass: 'sortable-drag',
                  onEnd: function (evt) {
                      const orderedNames = Array.from(catalogTableBody.children).map(row => row.dataset.name);
                      fetch('/api/catalogs/reorder', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderedNames })
                      }).then(res => res.json())
                        .then(data => {
                            if (data.code === 200) {
                                showMessage('分类排序已更新', 'success');
                                fetchAndPopulateCatalogs();
                            } else {
                                showMessage(data.message, 'error');
                                fetchCatalogs();
                            }
                        }).catch(err => {
                            showMessage('更新分类排序失败', 'error');
                            fetchCatalogs();
                        });
                  },
              });
          }

          // --- 初始化加载 ---
          fetchConfigs();
          fetchPendingConfigs();
          fetchCatalogs();
          fetchAndPopulateCatalogs();
          initSortable();
          initSortableCatalogs();

          deleteAllBtn.addEventListener('click', () => {
              if (!confirm('【警告】您確定要刪除所有書籤資料嗎？')) return;
              if (!confirm('此操作將會清空整個書籤列表且無法復原，請再次確認！')) return;
              fetch('/api/config/all', {
                  method: 'DELETE'
              }).then(res => res.json())
                .then(data => {
                    if (data.code === 200) {
                        showMessage('所有書籤已成功刪除', 'success');
                        fetchConfigs();
                        fetchAndPopulateCatalogs();
                        fetchCatalogs();
                    } else {
                        showMessage(data.message, 'error');
                    }
                }).catch(err => showMessage('網路錯誤或刪除失敗', 'error'));
          });

          migrateCatalogsBtn.addEventListener('click', () => {
              if (!confirm('這將會從現有書籤中提取所有分類並建立初始排序，您確定要執行嗎？此操作對現有分類是安全的。')) return;
              fetch('/api/catalogs/migrate', {
                  method: 'POST'
              }).then(res => res.json())
                .then(data => {
                    if (data.code === 200) {
                        showMessage(data.message, 'success');
                        fetchCatalogs();
                    } else {
                        showMessage(data.message, 'error');
                    }
                }).catch(err => showMessage('遷移失敗', 'error'));
          });

          // [NEW] 为新功能添加事件监听器
          document.getElementById('addCatalogBtn').addEventListener('click', () => {
              handleEditCatalog(null); // 传 null 表示新增
          });

          document.getElementById('editCatalogModalClose').addEventListener('click', () => {
              editCatalogModal.style.display = 'none';
          });

          document.getElementById('editCatalogForm').addEventListener('submit', function(e) {
              e.preventDefault();
              const id = document.getElementById('editCatalogId').value;
              const oldName = document.getElementById('editCatalogOldName').value;
              const newName = document.getElementById('editCatalogName').value;
              const icon = document.getElementById('editCatalogIcon').value;
              
              const isNew = !id;
              const url = isNew ? '/api/catalogs' : '/api/catalogs';
              const method = isNew ? 'POST' : 'PUT';
              const body = isNew ? { name: newName, icon } : { id, oldName, newName, icon };

              fetch(url, {
                  method: method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body)
              }).then(res => res.json())
                .then(data => {
                    if (data.code === 200 || data.code === 201) {
                        showMessage('操作成功', 'success');
                        fetchCatalogs();
                        fetchAndPopulateCatalogs(); // 刷新书签表单的 datalist
                        if (!isNew && oldName !== newName) {
                            fetchConfigs(); // 如果重命名了分类，则刷新书签列表
                        }
                        editCatalogModal.style.display = 'none';
                    } else {
                        showMessage(data.message, 'error');
                    }
                }).catch(err => showMessage('操作失败', 'error'));
          });
          `
    }
    return fileContents[filePath]
    },
  
    async renderAdminPage() {
    const html = await this.getFileContent('admin.html');
    return new Response(html, {
        headers: {'Content-Type': 'text/html; charset=utf-8'}
    });
    },
  
    async renderLoginPage() {
      const html = `<!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>管理员登录</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Noto Sans SC', sans-serif;
            background-color: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .login-container {
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 360px;
          }
          .login-title {
            font-size: 1.5rem;
            text-align: center;
            margin-bottom: 1.5rem;
            color: #333;
          }
          .form-group {
            margin-bottom: 1rem;
          }
          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #555;
          }
          input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            transition: border-color 0.2s;
          }
          input:focus {
            border-color: #7209b7;
            outline: none;
            box-shadow: 0 0 0 2px rgba(114, 9, 183, 0.2);
          }
          button {
            width: 100%;
            padding: 0.75rem;
            background-color: #7209b7;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          button:hover {
            background-color: #5a067c;
          }
          .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            display: none;
          }
          .back-link {
            display: block;
            text-align: center;
            margin-top: 1rem;
            color: #7209b7;
            text-decoration: none;
            font-size: 0.875rem;
          }
          .back-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="login-container">
          <h1 class="login-title">管理员登录</h1>
          <form id="loginForm">
            <div class="form-group">
              <label for="username">用户名</label>
              <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
              <label for="password">密码</label>
              <input type="password" id="password" name="password" required>
            </div>
            <div class="error-message" id="errorMessage">用户名或密码错误</div>
            <button type="submit">登录</button>
          </form>
          <a href="/" class="back-link">返回首页</a>
        </div>
        
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('loginForm');
            const errorMessage = document.getElementById('errorMessage');
            
            loginForm.addEventListener('submit', function(e) {
              e.preventDefault();
              
              const username = document.getElementById('username').value;
              const password = document.getElementById('password').value;
              
              window.location.href = '/admin?name=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password);
            });
          });
        </script>
      </body>
      </html>`;
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
  };
  
  
  // =================================================================================
  // 前端页面渲染函数
  // =================================================================================
  async function handleRequest(request, env, ctx) {
    const url = new URL(request.url);
    const catalogParam = url.searchParams.get('catalog');

    let sites = [];
    let catalogs = [];
    try {
      // --- [MODIFIED] 前端只獲取公開的分類和書籤 ---
      const results = await env.NAV_DB.batch([
        // [MODIFIED] 查询分类时也获取 icon 字段
        env.NAV_DB.prepare('SELECT name, icon FROM catalogs WHERE is_private = 0 ORDER BY sort_order ASC'),
        env.NAV_DB.prepare('SELECT s.* FROM sites s JOIN catalogs c ON s.catelog = c.name WHERE s.is_private = 0 AND c.is_private = 0 ORDER BY s.sort_order ASC, s.create_time DESC')
      ]);
      // [MODIFIED] catalogs 现在是包含 name 和 icon 的对象数组
      catalogs = results[0].results;
      sites = results[1].results;

    } catch (e) {
       if (e.message && e.message.includes('no such table: catalogs')) {
            console.warn('Fallback: `catalogs` table not found. Reading catalogs from `sites` table.');
            const { results } = await env.NAV_DB.prepare('SELECT * FROM sites ORDER BY create_time DESC').all();
            sites = results;
            // Fallback 模式下，catalogs 是字符串数组，需要转换为对象数组
            const catalogNames = Array.from(new Set(sites.map(s => s.catelog))).sort();
            catalogs = catalogNames.map(name => ({ name, icon: null }));
       } else {
           return new Response(`Failed to fetch data: ${e.message}`, { status: 500 });
       }
    }

    if (!sites) {
      return new Response('No site configuration found.', { status: 404 });
    }
    
    const currentCatalog = catalogParam;
    const currentSites = currentCatalog ? sites.filter(s => s.catelog === currentCatalog) : sites;

    const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>aki nav</title>
      <link rel="icon" type="image/png" href="https://img.tool.hidns.vip/file/1749062089225_apple-touch-icon.png">
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet"/>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                primary: {
                  50: '#f4f1fd', 100: '#e9e3fb', 200: '#d3c7f7', 300: '#b0a0f0', 400: '#8a70e7',
                  500: '#7209b7', 600: '#6532cc', 700: '#5429ab', 800: '#46238d', 900: '#3b1f75', 950: '#241245',
                },
              },
              fontFamily: {
                sans: ['Noto Sans SC', 'sans-serif'],
              },
            }
          }
        }
      </script>
      <style>
        body {
          background-image: url('https://img.tool.hidns.vip/file/1744533540720_illust_128103580_20250412_151433.jpg');
          background-size: cover;
          background-position: center center;
          background-attachment: fixed;
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(114, 9, 183, 0.5); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(114, 9, 183, 0.8); }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .copy-success-animation { animation: fadeInOut 2s ease forwards; }
        @media (max-width: 1023px) {
          .mobile-sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
          .mobile-sidebar.open { transform: translateX(0); }
          .mobile-overlay { opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
          .mobile-overlay.open { opacity: 1; pointer-events: auto; }
        }
        .line-clamp-2 {
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        #sidebar-toggle:checked ~ .sidebar { margin-left: -16rem; }
        #sidebar-toggle:checked ~ .main-content { margin-left: 0; }
        #sidebar-toggle:checked ~ .sidebar { margin-left: -16rem; /* 对应 w-64 */ }
        #sidebar-toggle:checked ~ .main-content { margin-left: 0; }
        
        /* --- [BUG FIX] --- */
        /* 默认隐藏桌面版的“展开”按钮 */
        #sidebar-expand-toggle {
          display: none;
        }
        /* 仅在桌面尺寸 (lg) 且侧边栏收起时，显示“展开”按钮 */
        @media (min-width: 1024px) {
          #sidebar-toggle:checked ~ #sidebar-expand-toggle {
            display: block;
          }
        }
      </style>
    </head>
    <body class="font-sans text-slate-800">
      <input type="checkbox" id="sidebar-toggle" class="hidden">
      <label for="sidebar-toggle" id="sidebar-expand-toggle" class="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/50 backdrop-blur-md shadow-md hover:bg-white/80 transition cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
    </label>
      
      <div class="fixed top-4 left-4 z-50 lg:hidden">
        <button id="sidebarToggle" class="p-2 rounded-lg bg-white/50 backdrop-blur-md shadow-md hover:bg-white/80 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      
      <div id="mobileOverlay" class="fixed inset-0 bg-black/60 z-40 mobile-overlay lg:hidden"></div>
      
      <aside id="sidebar" class="sidebar fixed left-0 top-0 h-full w-64 bg-white/60 backdrop-blur-xl border-r border-white/30 text-slate-800 z-50 overflow-y-auto mobile-sidebar lg:ml-0 lg:transform-none transition-all duration-300">
        <div class="p-4">
          <div class="flex items-center justify-between mb-6 pt-2">
            <h2 class="text-2xl font-bold text-primary-500" style="text-shadow: 0 0 10px rgba(255,255,255,0.5);">aki</h2>
            <button id="closeSidebar" class="p-1 rounded-full hover:bg-black/10 lg:hidden transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <label for="sidebar-toggle" class="p-1 rounded-full hover:bg-black/10 hidden lg:block cursor-pointer transition">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            </label>
          </div>
          
          <div class="mb-5 relative">
            <input id="searchInput" type="text" placeholder="搜索书签..." class="w-full pl-10 pr-4 py-2 border border-slate-300/50 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <div>
            <h3 class="px-3 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">分类导航</h3>
            <div class="space-y-1">
              <a href="?" class="flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${!currentCatalog ? 'bg-primary-500/20 text-primary-600' : 'hover:bg-primary-500/10 text-slate-600'} w-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                全部
              </a>
              ${catalogs.map(cat => `
                <a href="?catalog=${encodeURIComponent(cat.name)}" class="flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${cat.name === currentCatalog ? 'bg-primary-500/20 text-primary-600' : 'hover:bg-primary-500/10 text-slate-600'} w-full">
                  ${cat.icon 
                    ? `<img src="${cat.icon}" class="h-5 w-5 mr-3 rounded-sm object-cover">` 
                    : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>`
                  }
                  ${cat.name}
                </a>
              `).join('')}
            </div>
          </div>
          
          <div class="mt-8 pt-6 border-t border-slate-300/50">
             <button id="addSiteBtnSidebar" class="w-full flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition shadow-lg shadow-primary-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              添加新书签
            </button>
             <a href="/admin" target="_blank" class="mt-4 flex items-center justify-center px-4 py-2 text-slate-600 hover:text-primary-500 font-medium transition duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              后台管理
            </a>
          </div>
        </div>
      </aside>
      
      <main class="main-content lg:ml-64 min-h-screen transition-all duration-300">
        <header class="py-12 px-6 md:px-10 text-center">
          <div class="max-w-5xl mx-auto">
             <h1 class="text-4xl md:text-5xl font-bold text-white mb-2" style="text-shadow: 0 2px 10px rgba(0,0,0,0.5);">aki</h1>
             <p class="text-lg text-white/80" style="text-shadow: 0 1px 5px rgba(0,0,0,0.5);">我的个人公开书签</p>
          </div>
        </header>
        
        <section class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-white" style="text-shadow: 0 1px 5px rgba(0,0,0,0.5);">
              ${currentCatalog ? `${currentCatalog} · ${currentSites.length} 个网站` : `全部收藏 · ${sites.length} 个网站`}
            </h2>
          </div>
          
          <div id="sitesGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            ${currentSites.map(site => `
              <div class="site-card group bg-white/50 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg hover:border-white/40 hover:shadow-xl transition-all duration-300" data-id="${site.id}" data-name="${site.name}" data-url="${site.url}" data-catalog="${site.catelog}">
                <div class="p-5">
                  <a href="${site.url}" target="_blank" class="block">
                    <div class="flex items-center mb-3">
                      <div class="flex-shrink-0 mr-4 w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center p-1 shadow-inner">
                        ${site.logo 
                          ? `<img src="${site.logo}" alt="${site.name}" class="w-full h-full rounded-md object-cover">`
                          : `<div class="w-full h-full rounded-md bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl">${site.name.charAt(0)}</div>`
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <h3 class="text-base font-semibold text-slate-800 truncate" title="${site.name}">${site.name}</h3>
                        <span class="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-700">
                          ${site.catelog}
                        </span>
                      </div>
                    </div>
                    
                    <p class="text-sm text-slate-600 line-clamp-2 h-10" title="${site.desc || '暂无描述'}">${site.desc || '暂无描述'}</p>
                  </a>
                  
                  <div class="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
                    <a href="${site.url}" target="_blank" class="text-xs text-slate-500 truncate max-w-[140px] hover:text-primary-500 transition">${site.url.replace(/^https?:\/\//, '')}</a>
                    <div class="relative">
                       <button class="copy-btn flex items-center px-2 py-1 bg-slate-200/50 text-slate-600 hover:bg-primary-500/20 hover:text-primary-600 rounded-full text-xs font-medium transition-colors" data-url="${site.url}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" /><path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" /></svg>
                        复制
                      </button>
                      <span class="copy-success hidden absolute -bottom-8 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-md">已复制!</span>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </main>
      
      <button id="backToTop" class="fixed bottom-8 right-8 p-3 rounded-full bg-primary-500/80 backdrop-blur-md text-white shadow-lg opacity-0 invisible transition-all duration-300 hover:bg-primary-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>
      </button>
      
      <div id="addSiteModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 opacity-0 invisible transition-all duration-300">
        <div class="bg-slate-50 rounded-xl shadow-2xl w-full max-w-md mx-4 transform translate-y-8 transition-all duration-300">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-slate-900">请求新书签</h2>
              <button id="closeModal" class="text-slate-400 hover:text-slate-600 transition"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form id="addSiteForm" class="space-y-4">
              <div>
                <label for="addSiteName" class="block text-sm font-medium text-slate-700">名称</label>
                <input type="text" id="addSiteName" required class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              </div>
              <div>
                <label for="addSiteUrl" class="block text-sm font-medium text-slate-700">网址</label>
                <input type="text" id="addSiteUrl" required class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              </div>
              <div>
                <label for="addSiteLogo" class="block text-sm font-medium text-slate-700">Logo (可选)</label>
                <input type="text" id="addSiteLogo" class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              </div>
              <div>
                <label for="addSiteDesc" class="block text-sm font-medium text-slate-700">描述 (可选)</label>
                <textarea id="addSiteDesc" rows="2" class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"></textarea>
              </div>
              <div>
                <label for="addSiteCatelog" class="block text-sm font-medium text-slate-700">分类</label>
                <input type="text" id="addSiteCatelog" required class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" list="publicCatalogList">
                <datalist id="publicCatalogList"></datalist>
              </div>
              <div class="flex justify-end pt-4">
                <button type="button" id="cancelAddSite" class="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3">取消</button>
                <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">提交</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const sidebar = document.getElementById('sidebar');
          const mobileOverlay = document.getElementById('mobileOverlay');
          const sidebarToggle = document.getElementById('sidebarToggle');
          const closeSidebar = document.getElementById('closeSidebar');
          
          function openSidebar() { sidebar.classList.add('open'); mobileOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
          function closeSidebarMenu() { sidebar.classList.remove('open'); mobileOverlay.classList.remove('open'); document.body.style.overflow = ''; }
          
          if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
          if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarMenu);
          if (mobileOverlay) mobileOverlay.addEventListener('click', closeSidebarMenu);
          
          function populatePublicCatalogs() {
              const dataList = document.getElementById('publicCatalogList');
              if (!dataList) return;
              fetch('/api/catalogs').then(res => res.json()).then(data => {
                  if (data.code === 200 && Array.isArray(data.data)) {
                      dataList.innerHTML = '';
                      data.data.forEach(catalog => {
                          const option = document.createElement('option');
                          option.value = catalog.name;
                          dataList.appendChild(option);
                      });
                  }
              }).catch(err => console.error('Failed to load public catalogs:', err));
          }
          populatePublicCatalogs();

          document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
              e.preventDefault(); e.stopPropagation();
              const url = this.getAttribute('data-url');
              navigator.clipboard.writeText(url).then(() => {
                const successMsg = this.nextElementSibling;
                successMsg.classList.remove('hidden');
                successMsg.classList.add('copy-success-animation');
                setTimeout(() => {
                  successMsg.classList.add('hidden');
                  successMsg.classList.remove('copy-success-animation');
                }, 2000);
              }).catch(err => { console.error('复制失败:', err); alert('复制失败'); });
            });
          });
          
          const backToTop = document.getElementById('backToTop');
          window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
              backToTop.classList.remove('opacity-0', 'invisible');
            } else {
              backToTop.classList.add('opacity-0', 'invisible');
            }
          });
          if (backToTop) {
            backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
          }
          
          const addSiteModal = document.getElementById('addSiteModal');
          const addSiteBtnSidebar = document.getElementById('addSiteBtnSidebar');
          const closeModalBtn = document.getElementById('closeModal');
          const cancelAddSite = document.getElementById('cancelAddSite');
          const addSiteForm = document.getElementById('addSiteForm');
          
          function openModal() {
            if (addSiteModal) {
              addSiteModal.classList.remove('opacity-0', 'invisible');
              addSiteModal.querySelector('.max-w-md').classList.remove('translate-y-8');
              document.body.style.overflow = 'hidden';
            }
          }
          
          function closeModal() {
            if (addSiteModal) {
              addSiteModal.classList.add('opacity-0', 'invisible');
              addSiteModal.querySelector('.max-w-md').classList.add('translate-y-8');
              document.body.style.overflow = '';
            }
          }
          
          if (addSiteBtnSidebar) addSiteBtnSidebar.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openModal(); });
          if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
          if (cancelAddSite) cancelAddSite.addEventListener('click', closeModal);
          if (addSiteModal) addSiteModal.addEventListener('click', e => { if (e.target === addSiteModal) closeModal(); });
          
          if (addSiteForm) {
            addSiteForm.addEventListener('submit', function(e) {
              e.preventDefault();
              const formData = {
                name: document.getElementById('addSiteName').value, url: document.getElementById('addSiteUrl').value,
                logo: document.getElementById('addSiteLogo').value, desc: document.getElementById('addSiteDesc').value,
                catelog: document.getElementById('addSiteCatelog').value
              };
              fetch('/api/config/submit', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
              }).then(res => res.json()).then(data => {
                if (data.code === 201) {
                  const successDiv = document.createElement('div');
                  successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-[101]';
                  successDiv.textContent = '提交成功，等待管理员审核';
                  document.body.appendChild(successDiv);
                  setTimeout(() => { successDiv.style.opacity = '0'; setTimeout(() => successDiv.remove(), 300); }, 2500);
                  closeModal(); addSiteForm.reset();
                } else { alert(data.message || '提交失败'); }
              }).catch(err => { console.error('网络错误:', err); alert('网络错误，请稍后重试'); });
            });
          }
          
          const searchInput = document.getElementById('searchInput');
          if (searchInput) {
            searchInput.addEventListener('input', function() {
              const keyword = this.value.toLowerCase().trim();
              document.querySelectorAll('.site-card').forEach(card => {
                const name = card.dataset.name.toLowerCase();
                const url = card.dataset.url.toLowerCase();
                const catalog = card.dataset.catalog.toLowerCase();
                card.style.display = (name.includes(keyword) || url.includes(keyword) || catalog.includes(keyword)) ? '' : 'none';
              });
            });
          }
        });
      </script>
    </body>
    </html>
    `;

return new Response(html, {
  headers: { 'content-type': 'text/html; charset=utf-8' }
});
}


// 导出主模块
export default {
async fetch(request, env, ctx) {
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/api')) {
    return api.handleRequest(request, env, ctx);
  } else if (url.pathname === '/admin' || url.pathname.startsWith('/static')) {
    return admin.handleRequest(request, env, ctx);
  } else {
    return handleRequest(request, env, ctx);
  }
},
};
