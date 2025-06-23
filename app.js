// アプリケーションの状態管理
class StakeholderApp {
    constructor() {
        this.data = {
            stakeholders: [
                {
                    id: "person1",
                    name: "吉村",
                    targetMarket: "中小企業向けDXソリューション",
                    stakeholders: [
                        {id: "sh1", genre: "専門サービス", detail: "IT戦略コンサルタント", category: "professional"},
                        {id: "sh2", genre: "IT・デジタル", detail: "システムエンジニア", category: "digital"},
                        {id: "sh3", genre: "ビジネス関係", detail: "既存取引先", category: "business"},
                        {id: "sh4", genre: "組織内関係", detail: "開発チームリーダー", category: "internal"}
                    ]
                },
                {
                    id: "person2", 
                    name: "相川",
                    targetMarket: "地域密着型サービス業",
                    stakeholders: [
                        {id: "sh5", genre: "専門サービス", detail: "税理士", category: "professional"},
                        {id: "sh6", genre: "外部組織", detail: "商工会議所", category: "external"},
                        {id: "sh7", genre: "ビジネス関係", detail: "地域顧客", category: "business"}
                    ]
                },
                {
                    id: "person3",
                    name: "田中",
                    targetMarket: "製造業向けIoTソリューション", 
                    stakeholders: [
                        {id: "sh8", genre: "IT・デジタル", detail: "IoTエンジニア", category: "digital"},
                        {id: "sh9", genre: "専門サービス", detail: "技術士", category: "professional"},
                        {id: "sh10", genre: "ビジネス関係", detail: "製造業パートナー", category: "business"}
                    ]
                }
            ]
        };

        this.categories = {
            professional: {name: "専門サービス", color: "#e74c3c"},
            digital: {name: "IT・デジタル", color: "#3498db"},
            business: {name: "ビジネス関係", color: "#2ecc71"},
            internal: {name: "組織内関係", color: "#9b59b6"},
            external: {name: "外部組織", color: "#f39c12"},
            education: {name: "教育・研修", color: "#1abc9c"},
            other: {name: "その他", color: "#95a5a6"}
        };

        this.currentEditId = null;
        this.editingStakeholderId = null;
        this.tempEditData = null; // 新規作成時の一時データ
        this.init();
    }

    getCategoryByGenre(genre) {
        const genreMap = {
            "専門サービス": "professional",
            "IT・デジタル": "digital", 
            "ビジネス関係": "business",
            "組織内関係": "internal",
            "外部組織": "external",
            "教育・研修": "education",
            "その他": "other"
        };
        return genreMap[genre] || "other";
    }

    init() {
        this.setupEventListeners();
        this.renderMainView();
        this.updateCount();
    }

    setupEventListeners() {
        // メイン画面のイベント
        document.getElementById('add-new-btn').addEventListener('click', () => this.showEditView());
        document.getElementById('overview-btn').addEventListener('click', () => this.showOverviewView());

        // 編集画面のイベント
        document.getElementById('back-btn').addEventListener('click', () => this.showMainView());
        document.getElementById('save-btn').addEventListener('click', () => this.saveCurrentEdit());
        document.getElementById('delete-btn').addEventListener('click', () => this.deleteCurrent());

        // ステークホルダー追加・編集
        document.getElementById('add-stakeholder-btn').addEventListener('click', () => this.addStakeholder());
        document.getElementById('update-stakeholder-btn').addEventListener('click', () => this.updateStakeholder());
        document.getElementById('cancel-stakeholder-btn').addEventListener('click', () => this.cancelStakeholderEdit());

        // 俯瞰表示
        document.getElementById('overview-back-btn').addEventListener('click', () => this.showMainView());

        // リアルタイム更新のためのイベント
        document.getElementById('person-name').addEventListener('input', () => this.renderEditDiagram());
        document.getElementById('target-market').addEventListener('input', () => this.renderEditDiagram());
    }

    showMainView() {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('main-view').classList.add('active');
        this.tempEditData = null;
        this.renderMainView();
    }

    showEditView(personId = null) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('edit-view').classList.add('active');
        
        this.currentEditId = personId;
        this.loadEditData(personId);
        this.renderEditDiagram();
    }

    showOverviewView() {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('overview-view').classList.add('active');
        this.renderOverviewCheckboxes();
        this.renderOverviewDiagram();
    }

    renderMainView() {
        const grid = document.getElementById('stakeholder-grid');
        grid.innerHTML = '';

        // 既存の関係図を表示
        this.data.stakeholders.forEach(person => {
            const card = this.createStakeholderCard(person);
            grid.appendChild(card);
        });

        // 新規追加カード
        if (this.data.stakeholders.length < 30) {
            const addCard = document.createElement('div');
            addCard.className = 'stakeholder-card add-card';
            addCard.innerHTML = `
                <div class="add-icon">+</div>
                <div>新規追加</div>
            `;
            addCard.addEventListener('click', () => this.showEditView());
            grid.appendChild(addCard);
        }
    }

    createStakeholderCard(person) {
        const card = document.createElement('div');
        card.className = 'stakeholder-card';
        
        const stakeholderTags = person.stakeholders.map(sh => {
            const category = this.getCategoryByGenre(sh.genre);
            const color = this.categories[category].color;
            return `<span class="stakeholder-tag" style="background-color: ${color}">${sh.detail}</span>`;
        }).join('');

        card.innerHTML = `
            <h3>${person.name}</h3>
            <div class="target-market">${person.targetMarket}</div>
            <div class="stakeholder-preview">${stakeholderTags}</div>
        `;

        card.addEventListener('click', () => this.showEditView(person.id));
        return card;
    }

    loadEditData(personId) {
        if (personId) {
            const person = this.data.stakeholders.find(p => p.id === personId);
            if (person) {
                document.getElementById('person-name').value = person.name;
                document.getElementById('target-market').value = person.targetMarket;
                this.renderStakeholderList(person.stakeholders);
                document.getElementById('delete-btn').style.display = 'block';
                return;
            }
        }
        
        // 新規作成の場合
        document.getElementById('person-name').value = '';
        document.getElementById('target-market').value = '';
        this.tempEditData = {
            stakeholders: []
        };
        this.renderStakeholderList([]);
        document.getElementById('delete-btn').style.display = 'none';
    }

    renderStakeholderList(stakeholders) {
        const container = document.getElementById('stakeholder-items');
        container.innerHTML = '';

        stakeholders.forEach(sh => {
            const item = document.createElement('div');
            item.className = 'stakeholder-item';
            item.innerHTML = `
                <div class="stakeholder-info">
                    <div class="stakeholder-genre">${sh.genre}</div>
                    <div class="stakeholder-detail">${sh.detail}</div>
                </div>
                <div class="stakeholder-actions">
                    <button class="btn-icon" onclick="app.editStakeholder('${sh.id}')">✏️</button>
                    <button class="btn-icon" onclick="app.removeStakeholder('${sh.id}')">🗑️</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    addStakeholder() {
        const genre = document.getElementById('stakeholder-genre').value;
        const detail = document.getElementById('stakeholder-detail').value.trim();

        if (!genre || !detail) {
            alert('ジャンルと詳細項目を入力してください');
            return;
        }

        const newStakeholder = {
            id: 'sh' + Date.now(),
            genre: genre,
            detail: detail,
            category: this.getCategoryByGenre(genre)
        };

        // 現在編集中の人を取得または作成
        if (this.currentEditId) {
            const person = this.data.stakeholders.find(p => p.id === this.currentEditId);
            person.stakeholders.push(newStakeholder);
            this.renderStakeholderList(person.stakeholders);
        } else {
            // 新規作成の場合は一時データに追加
            this.tempEditData.stakeholders.push(newStakeholder);
            this.renderStakeholderList(this.tempEditData.stakeholders);
        }

        // フォームをクリア
        document.getElementById('stakeholder-genre').value = '';
        document.getElementById('stakeholder-detail').value = '';

        this.renderEditDiagram();
    }

    editStakeholder(stakeholderId) {
        const stakeholders = this.getCurrentStakeholders();
        const stakeholder = stakeholders.find(sh => sh.id === stakeholderId);
        
        if (stakeholder) {
            this.editingStakeholderId = stakeholderId;
            document.getElementById('stakeholder-genre').value = stakeholder.genre;
            document.getElementById('stakeholder-detail').value = stakeholder.detail;
            
            // ボタン表示を切り替え
            document.getElementById('add-stakeholder-btn').classList.add('hidden');
            document.getElementById('update-stakeholder-btn').classList.remove('hidden');
            document.getElementById('cancel-stakeholder-btn').classList.remove('hidden');
        }
    }

    updateStakeholder() {
        const genre = document.getElementById('stakeholder-genre').value;
        const detail = document.getElementById('stakeholder-detail').value.trim();

        if (!genre || !detail) {
            alert('ジャンルと詳細項目を入力してください');
            return;
        }

        const stakeholders = this.getCurrentStakeholders();
        const stakeholder = stakeholders.find(sh => sh.id === this.editingStakeholderId);
        
        if (stakeholder) {
            stakeholder.genre = genre;
            stakeholder.detail = detail;
            stakeholder.category = this.getCategoryByGenre(genre);
        }

        this.cancelStakeholderEdit();
        this.renderStakeholderList(stakeholders);
        this.renderEditDiagram();
    }

    cancelStakeholderEdit() {
        this.editingStakeholderId = null;
        document.getElementById('stakeholder-genre').value = '';
        document.getElementById('stakeholder-detail').value = '';
        
        // ボタン表示を戻す
        document.getElementById('add-stakeholder-btn').classList.remove('hidden');
        document.getElementById('update-stakeholder-btn').classList.add('hidden');
        document.getElementById('cancel-stakeholder-btn').classList.add('hidden');
    }

    removeStakeholder(stakeholderId) {
        if (confirm('このステークホルダーを削除しますか？')) {
            if (this.currentEditId) {
                const person = this.data.stakeholders.find(p => p.id === this.currentEditId);
                person.stakeholders = person.stakeholders.filter(sh => sh.id !== stakeholderId);
                this.renderStakeholderList(person.stakeholders);
            } else {
                this.tempEditData.stakeholders = this.tempEditData.stakeholders.filter(sh => sh.id !== stakeholderId);
                this.renderStakeholderList(this.tempEditData.stakeholders);
            }
            this.renderEditDiagram();
        }
    }

    getCurrentStakeholders() {
        if (this.currentEditId) {
            const person = this.data.stakeholders.find(p => p.id === this.currentEditId);
            return person.stakeholders;
        } else {
            return this.tempEditData ? this.tempEditData.stakeholders : [];
        }
    }

    getCurrentEditPerson() {
        if (this.currentEditId) {
            return this.data.stakeholders.find(p => p.id === this.currentEditId);
        } else {
            // 新規作成中の一時的なオブジェクト
            return {
                id: null,
                name: document.getElementById('person-name').value || '',
                targetMarket: document.getElementById('target-market').value || '',
                stakeholders: this.tempEditData ? this.tempEditData.stakeholders : []
            };
        }
    }

    saveCurrentEdit() {
        const name = document.getElementById('person-name').value.trim();
        const targetMarket = document.getElementById('target-market').value.trim();

        if (!name || !targetMarket) {
            alert('担当者名とターゲットマーケットを入力してください');
            return;
        }

        if (this.currentEditId) {
            // 既存の編集
            const person = this.data.stakeholders.find(p => p.id === this.currentEditId);
            person.name = name;
            person.targetMarket = targetMarket;
        } else {
            // 新規作成
            const newPerson = {
                id: 'person' + Date.now(),
                name: name,
                targetMarket: targetMarket,
                stakeholders: this.tempEditData ? this.tempEditData.stakeholders : []
            };
            this.data.stakeholders.push(newPerson);
        }

        this.updateCount();
        this.showMainView();
    }

    deleteCurrent() {
        if (this.currentEditId && confirm('この関係図を削除しますか？')) {
            this.data.stakeholders = this.data.stakeholders.filter(p => p.id !== this.currentEditId);
            this.updateCount();
            this.showMainView();
        }
    }

    updateCount() {
        document.getElementById('count').textContent = this.data.stakeholders.length;
    }

    renderEditDiagram() {
        const svg = d3.select('#edit-diagram');
        svg.selectAll('*').remove();
        
        const person = this.getCurrentEditPerson();
        const width = 600;
        const height = 600;
        const centerX = width / 2;
        const centerY = height / 2;
        const centerRadius = 60;
        const stakeholderRadius = 30;
        const ringRadius = 200;

        // 中心円
        svg.append('circle')
            .attr('cx', centerX)
            .attr('cy', centerY)
            .attr('r', centerRadius)
            .attr('class', 'center-circle');

        // 担当者名を中心円の縁に表示
        if (person.name) {
            svg.append('text')
                .attr('x', centerX)
                .attr('y', centerY - centerRadius - 10)
                .attr('class', 'center-name')
                .style('fill', 'var(--color-text)')
                .style('font-weight', '600')
                .style('font-size', '14px')
                .style('text-anchor', 'middle')
                .text(person.name);
        }

        // ターゲットマーケットを中心に表示
        if (person.targetMarket) {
            const lines = this.wrapText(person.targetMarket, 10);
            lines.forEach((line, i) => {
                svg.append('text')
                    .attr('x', centerX)
                    .attr('y', centerY + (i - lines.length/2 + 0.5) * 16)
                    .attr('class', 'center-text')
                    .text(line);
            });
        }

        // ステークホルダー円
        person.stakeholders.forEach((stakeholder, i) => {
            const angle = (i * 2 * Math.PI) / person.stakeholders.length;
            const x = centerX + ringRadius * Math.cos(angle);
            const y = centerY + ringRadius * Math.sin(angle);
            const color = this.categories[stakeholder.category].color;

            // 接続線
            svg.append('line')
                .attr('x1', centerX + centerRadius * Math.cos(angle))
                .attr('y1', centerY + centerRadius * Math.sin(angle))
                .attr('x2', x - stakeholderRadius * Math.cos(angle))
                .attr('y2', y - stakeholderRadius * Math.sin(angle))
                .attr('class', 'connection-line');

            // ステークホルダー円
            svg.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', stakeholderRadius)
                .attr('class', 'stakeholder-circle')
                .style('fill', color);

            // ステークホルダーテキスト
            const lines = this.wrapText(stakeholder.detail, 8);
            lines.forEach((line, j) => {
                svg.append('text')
                    .attr('x', x)
                    .attr('y', y + (j - lines.length/2 + 0.5) * 12)
                    .attr('class', 'stakeholder-text')
                    .text(line);
            });
        });
    }

    wrapText(text, maxLength) {
        if (text.length <= maxLength) return [text];
        
        const words = text.split('');
        const lines = [];
        let currentLine = '';
        
        for (const char of words) {
            if (currentLine.length + 1 > maxLength) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine += char;
            }
        }
        
        if (currentLine) lines.push(currentLine);
        return lines;
    }

    renderOverviewCheckboxes() {
        const container = document.getElementById('overview-checkboxes');
        container.innerHTML = '';

        this.data.stakeholders.forEach(person => {
            const item = document.createElement('div');
            item.className = 'checkbox-item';
            item.innerHTML = `
                <input type="checkbox" id="check-${person.id}" checked>
                <label for="check-${person.id}" class="checkbox-label">${person.name}</label>
            `;
            item.addEventListener('change', () => this.renderOverviewDiagram());
            container.appendChild(item);
        });
    }

    renderOverviewDiagram() {
        const svg = d3.select('#overview-diagram');
        svg.selectAll('*').remove();
        
        const container = document.querySelector('.overview-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        svg.attr('width', width).attr('height', height);

        // チェックされた人だけを取得
        const selectedPeople = this.data.stakeholders.filter(person => {
            const checkbox = document.getElementById(`check-${person.id}`);
            return checkbox && checkbox.checked;
        });

        if (selectedPeople.length === 0) return;

        // すべてのノード（人とステークホルダー）を準備
        const nodes = [];
        const links = [];

        selectedPeople.forEach(person => {
            // 人のノード
            const personNode = {
                id: person.id,
                name: person.name,
                type: 'person',
                x: width/2 + (Math.random() - 0.5) * 200,
                y: height/2 + (Math.random() - 0.5) * 200
            };
            nodes.push(personNode);

            // ステークホルダーノード
            person.stakeholders.forEach(stakeholder => {
                const stakeholderNode = {
                    id: stakeholder.id,
                    detail: stakeholder.detail,
                    genre: stakeholder.genre,
                    category: stakeholder.category,
                    type: 'stakeholder',
                    personId: person.id
                };
                nodes.push(stakeholderNode);

                // 人とステークホルダーの接続
                links.push({
                    source: person.id,
                    target: stakeholder.id,
                    type: 'person-stakeholder'
                });
            });
        });

        // 同じジャンルのステークホルダー同士を接続（吸着効果）
        const stakeholdersByGenre = {};
        nodes.filter(n => n.type === 'stakeholder').forEach(node => {
            if (!stakeholdersByGenre[node.category]) {
                stakeholdersByGenre[node.category] = [];
            }
            stakeholdersByGenre[node.category].push(node);
        });

        Object.values(stakeholdersByGenre).forEach(genreNodes => {
            if (genreNodes.length > 1) {
                for (let i = 0; i < genreNodes.length - 1; i++) {
                    for (let j = i + 1; j < genreNodes.length; j++) {
                        links.push({
                            source: genreNodes[i].id,
                            target: genreNodes[j].id,
                            type: 'genre-cluster'
                        });
                    }
                }
            }
        });

        // Force simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
                if (d.type === 'person-stakeholder') return 80;
                if (d.type === 'genre-cluster') return 40;
                return 100;
            }))
            .force('charge', d3.forceManyBody().strength(d => {
                if (d.type === 'person') return -300;
                return -50;
            }))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(d => {
                return d.type === 'person' ? 35 : 15;
            }));

        // リンクを描画
        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('class', d => d.type === 'genre-cluster' ? 'cluster-connection' : 'connection-line');

        // ノードを描画
        const node = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .enter().append('g');

        // 円を描画
        node.append('circle')
            .attr('r', d => d.type === 'person' ? 30 : 12)
            .attr('class', d => d.type === 'person' ? 'overview-center-circle' : 'overview-stakeholder-circle')
            .style('fill', d => {
                if (d.type === 'person') return 'var(--color-primary)';
                return this.categories[d.category].color;
            });

        // テキストを描画
        node.append('text')
            .attr('class', d => d.type === 'person' ? 'overview-center-text' : 'stakeholder-text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', 'white')
            .style('font-size', d => d.type === 'person' ? '12px' : '8px')
            .text(d => {
                if (d.type === 'person') return d.name;
                return d.detail.length > 6 ? d.detail.substring(0, 6) + '...' : d.detail;
            });

        // シミュレーション更新
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('transform', d => `translate(${d.x},${d.y})`);
        });

        // ドラッグ機能
        node.call(d3.drag()
            .on('start', (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }));
    }
}

// アプリケーション初期化
const app = new StakeholderApp();