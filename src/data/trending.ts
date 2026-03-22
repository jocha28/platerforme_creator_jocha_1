export interface TrendingItem {
  id: string
  title: string
  artist: string
  type: string
  year: number
  coverArt: string
  slug: string
}

export const TRENDING_ITEMS: TrendingItem[] = [
  {
    id: 'tr-001',
    title: 'Obsidian Waves',
    artist: 'Synthetix',
    type: 'Single',
    year: 2024,
    slug: 'editorial-resonance',
    coverArt: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0La383yAqOF8V052iYP1q6fDO6i2idClHz9Rp8Mb7N3RZu3KDMrZKlDg1_FMzqB7CFD0v_uIjIJjUFoDdW3j8d_s-fOAo2y981Cf4swHZ8Ttu9GUUbjWogTTuImFuXPXhtUvD7ZP91LPGO-SoAfIeIwxRPQ9PBCh4rHNH_9xoDoWd7P83pXnekC7YjTZFpuEsUCFAp_-C-TdSyn3usZnIQf8mFrU3IV-qboUUYMydX8PU4ZJfdOlZq0I3_BGf_BWQnvxnzL_up2ef',
  },
  {
    id: 'tr-002',
    title: 'Electric Pulse',
    artist: 'Synthetix',
    type: 'Editorial Remix',
    year: 2023,
    slug: 'static-pulse',
    coverArt: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBi7t8pQdczESSxyKFZjfQzCFCI6QNTBZdcIV2dmhK-SSlqYZdNu6tl2PG_nsiJkEkj9wq6tLTgGMjwcJ4k4JYkFKuKomv3nquZ-B4WmRlhjXnhqEXC90fJ-s58qUzJIoK9kvhYkX1qozbjogAeVcOJZ08J-arP4IsmfBvmzI8K89fl51VYabG3kK3S84e1XGz8Sre0meibviRHyTxOshH5X7f1H4SUkitJqLKWWfUvVLubU2Cbjq21l9ESwI9QXEbhDNRczp2Ms0ze',
  },
  {
    id: 'tr-003',
    title: 'Shadow Architect',
    artist: 'Synthetix',
    type: 'EP',
    year: 2024,
    slug: 'nocturnal',
    coverArt: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5KD5TjQ1UuCY11s67h3GYlEUVfNDaiwuTeRbMwhq6ZUvbGINBrJIdgOT2VP_cFS_yv1nRcwRBOPNDPYdqPAAdZLnB_ygc9YIBbzNfVVG5giuXB_iiB9Q1dXz3DFj9xip7aC5mhRpJWaqbnALEqvy3sw7Hanuzd1jDoZ-GDZEdWFxyAelq40DwsZzSvZFjzFu7cnHz40uvuwFstEOYz4MBSaKu3wVpL-LTT7fmJc5_cM_4DNfmrhGz0luk8dwFRp8eS6aIH35Q1CLf',
  },
  {
    id: 'tr-004',
    title: 'Prism Theory',
    artist: 'Synthetix',
    type: 'Single',
    year: 2024,
    slug: 'midnight-theory',
    coverArt: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4z_0pD312p5XTzP9hZYPOkWdsOGE8tQnw8gRev4-dDBoSkP4OHeudos4_S_9twLFVAgrNRHNHyla2UPajGUH8o5c7OIRrzV193UvzbcceaGkYPHqQrkMkOkrv-dWfO9eoXHEiuaW4Xu_XyuvjvhZJ1hc9q6E7UuGTRSOstNp4CS9M0NbgnbXRxELEVqz8xpVdcrbVMEDV6CCuUmpgPPvORWki0zaV-IUyca-X-qMk_UL_2m7pg22YVSo4T4ebgbIe6drrFCx_izng',
  },
  {
    id: 'tr-005',
    title: 'Neon Drift',
    artist: 'Synthetix',
    type: 'Mixtape',
    year: 2022,
    slug: 'neon-void',
    coverArt: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYr2v5kULNT5AMhn9nIfJmFwph9hFv2JVebJYgNB5dUrSEhiFcL22CKICzFpMU10uiKRnB9GBpFd51_yV2_0G0o5KgQ9VyqW5Aje9kaQWVMWX7Lz5LBgx4A5aVeymBC4xAQAECbavXblNkmfb5vxlPlVBvjs5RbW-VWrdg8K3xDVyK26BUwdkShNeJm8OSi_-3XZMT-KegQWnjGyvePZB_9P7dt5YCqRC6rtc3xts-25zQqvUdyPQ6XpAuOFsanigf1TbEROJYXekq',
  },
  {
    id: 'tr-006',
    title: 'Digital Rain',
    artist: 'Synthetix',
    type: 'Single',
    year: 2024,
    slug: 'editorial-resonance',
    coverArt: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNJyumabYgYIJ4QDjaMaN-AjRa2itX7fepNKRwslEIvdm7428-BA9SYstWuKINDb07C3cuI7j3lNftTrTZBFx-cCkdE2iMS7gUh_i3mi0J72luy9ba9WBi6efyaIoXDpxQmIfrCjTlnpo7b5gecCztydqLmdVERxIVGbiXPpXqZXf1yPC0y9pLwoSPLfeKe1jP2PlQkMCb1fCxlG05A1ZrnseG0HSLOOASWHsfGZe4qgbOdewB3UUWFAs3FyJQ5mibsy9F3Av5nNIE',
  },
  {
    id: 'tr-007',
    title: 'Kinetic Waves',
    artist: 'Synthetix',
    type: 'Album',
    year: 2021,
    slug: 'kinetic-flow',
    coverArt: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD4Ld5fQ0MuD9GD8-7KIvS7c_q5G-MQFrJ2RHrLFpKQ3_aGCv3r6uba4wVSKhPncBonHc7wusXAg-V1qrpWIX13J4yweshZQu3Mk3Y-AcjF5Aw2n1xfIRVgp1aQ3DIFgbdNqKA_Cg0WaTucxA77pBvuu-SzS98_sq6YVsQ2Idw91w3ljjQkzV5Es36gQHze5wMztaSuADP8gksPo1Rj64VluWucoXYH7W7v4e5EJY187I-gaVbhXCHF8Mesng0bR49LMhnOCAkMRA9',
  },
  {
    id: 'tr-008',
    title: 'Jungle Rhythm',
    artist: 'Synthetix',
    type: 'LP',
    year: 2022,
    slug: 'concrete-jungle',
    coverArt: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMNt9FjbWA4drK-f317F1WkajJ8wygfaH58xPUleV--QUVdymQyAxtk7ImgPN03oe0UyTHiCFML6FHYYS2vZXk_5ROx4q3sKCtx7iGXZFfFmJ_XuOwJulVxCfyWJsEvqXeHXcbIb_0fn9Bz1VjC8XAQkzgyN2mBkoLIOk3FWm1vYtdfVMTqoGpxbEXw5uLEVgA2j9HqaQkbgVZdJQBp-bqh5fhJIxXyr_G3wGF3mCgbItUyPQG6FiPOCKZdLBxgExX1wCxU-U4G07B',
  },
]
