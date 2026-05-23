--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.event_images DROP CONSTRAINT IF EXISTS event_images_event_id_fkey;
ALTER TABLE IF EXISTS ONLY public.testimonials DROP CONSTRAINT IF EXISTS testimonials_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_setting_key_key;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.packages DROP CONSTRAINT IF EXISTS packages_pkey;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_title_theme_unique;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_pkey;
ALTER TABLE IF EXISTS ONLY public.event_images DROP CONSTRAINT IF EXISTS event_images_pkey;
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS bookings_pkey;
ALTER TABLE IF EXISTS ONLY public.analytics DROP CONSTRAINT IF EXISTS analytics_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_users DROP CONSTRAINT IF EXISTS admin_users_username_key;
ALTER TABLE IF EXISTS ONLY public.admin_users DROP CONSTRAINT IF EXISTS admin_users_pkey;
ALTER TABLE IF EXISTS public.testimonials ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.site_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.packages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.event_images ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bookings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.analytics ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.admin_users ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.testimonials_id_seq;
DROP TABLE IF EXISTS public.testimonials;
DROP SEQUENCE IF EXISTS public.site_settings_id_seq;
DROP TABLE IF EXISTS public.site_settings;
DROP SEQUENCE IF EXISTS public.packages_id_seq;
DROP TABLE IF EXISTS public.packages;
DROP SEQUENCE IF EXISTS public.events_id_seq;
DROP TABLE IF EXISTS public.events;
DROP SEQUENCE IF EXISTS public.event_images_id_seq;
DROP TABLE IF EXISTS public.event_images;
DROP SEQUENCE IF EXISTS public.bookings_id_seq;
DROP TABLE IF EXISTS public.bookings;
DROP SEQUENCE IF EXISTS public.analytics_id_seq;
DROP TABLE IF EXISTS public.analytics;
DROP SEQUENCE IF EXISTS public.admin_users_id_seq;
DROP TABLE IF EXISTS public.admin_users;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics (
    id integer NOT NULL,
    event_type character varying(100) NOT NULL,
    theme character varying(50),
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.analytics_id_seq OWNED BY public.analytics.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    client_name character varying(255) NOT NULL,
    event character varying(255) NOT NULL,
    event_date timestamp with time zone,
    message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'pending'::character varying,
    location character varying(255),
    theme_ref character varying(255),
    instagram character varying(255)
);


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: event_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_images (
    id integer NOT NULL,
    event_id integer,
    url text NOT NULL,
    is_cover boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: event_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_images_id_seq OWNED BY public.event_images.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    theme character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    category character varying(50) DEFAULT NULL::character varying
);


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.packages (
    id integer NOT NULL,
    theme character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    tag character varying(100) NOT NULL,
    features jsonb NOT NULL,
    is_popular boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: packages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.packages_id_seq OWNED BY public.packages.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id integer NOT NULL,
    client_name character varying(255) NOT NULL,
    role character varying(255),
    review text NOT NULL,
    rating integer DEFAULT 5,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: analytics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics ALTER COLUMN id SET DEFAULT nextval('public.analytics_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: event_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_images ALTER COLUMN id SET DEFAULT nextval('public.event_images_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: packages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages ALTER COLUMN id SET DEFAULT nextval('public.packages_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, username, password_hash, created_at) FROM stdin;
1	admin	$2b$10$zNmWpg7E29lxR.J7w34k7.qjloaXeR7TVxSMpuRxUGP.3lLbzuOZa	2026-05-17 00:15:09.69403+07
\.


--
-- Data for Name: analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analytics (id, event_type, theme, metadata, created_at) FROM stdin;
1	page_view	sport	{"path": "/"}	2026-05-16 22:21:48.964432+07
2	page_view	wedding	{"path": "/"}	2026-05-16 22:23:12.316051+07
3	page_view	sport	{"path": "/"}	2026-05-17 00:06:24.826086+07
4	page_view	sport	{"path": "/"}	2026-05-17 00:31:27.309072+07
5	page_view	wedding	{"path": "/"}	2026-05-17 00:31:32.151708+07
6	page_view	sport	{"path": "/"}	2026-05-17 00:31:37.414418+07
7	page_view	sport	{"path": "/"}	2026-05-17 14:06:50.221158+07
8	page_view	wedding	{"path": "/"}	2026-05-17 14:06:58.491308+07
9	page_view	wedding	{"path": "/"}	2026-05-17 14:09:19.351804+07
10	page_view	wedding	{"path": "/"}	2026-05-17 14:09:22.336557+07
11	page_view	wedding	{"path": "/"}	2026-05-17 14:09:49.34229+07
12	page_view	wedding	{"path": "/"}	2026-05-17 14:09:56.330431+07
13	page_view	wedding	{"path": "/"}	2026-05-17 14:11:15.637951+07
14	page_view	wedding	{"path": "/"}	2026-05-17 15:04:32.928489+07
15	page_view	wedding	{"path": "/"}	2026-05-17 15:14:00.082877+07
16	page_view	wedding	{"path": "/"}	2026-05-17 15:22:04.541311+07
17	page_view	wedding	{"path": "/"}	2026-05-17 15:28:15.381409+07
18	page_view	wedding	{"path": "/"}	2026-05-17 15:30:04.481257+07
19	page_view	sport	{"path": "/"}	2026-05-17 15:30:08.834719+07
20	page_view	wedding	{"path": "/"}	2026-05-17 15:30:13.915808+07
21	page_view	wedding	{"path": "/"}	2026-05-17 15:35:21.347582+07
22	page_view	wedding	{"path": "/"}	2026-05-17 15:35:50.338308+07
23	page_view	wedding	{"path": "/"}	2026-05-17 15:43:54.343247+07
24	page_view	wedding	{"path": "/"}	2026-05-17 15:44:36.332284+07
25	page_view	wedding	{"path": "/"}	2026-05-17 15:46:57.919493+07
26	page_view	wedding	{"path": "/"}	2026-05-17 17:56:35.002126+07
27	view_event	wedding	{"id": 15, "title": "test contoh"}	2026-05-17 17:56:50.757788+07
28	view_event	wedding	{"id": 28, "title": "The Wedding Ulfi & Hidayat ( 3 Minute Version )"}	2026-05-17 17:58:16.568471+07
29	page_view	wedding	{"path": "/"}	2026-05-17 18:02:10.455313+07
30	page_view	sport	{"path": "/"}	2026-05-17 18:02:36.984029+07
31	view_event	sport	{"id": 17, "title": "Karate"}	2026-05-17 18:02:45.097072+07
32	page_view	sport	{"path": "/"}	2026-05-17 18:29:56.102254+07
33	page_view	wedding	{"path": "/"}	2026-05-17 18:30:25.366772+07
34	page_view	wedding	{"path": "/"}	2026-05-17 18:37:05.375614+07
35	page_view	sport	{"path": "/"}	2026-05-17 18:37:13.693399+07
36	page_view	wedding	{"path": "/"}	2026-05-17 18:38:20.506585+07
37	page_view	sport	{"path": "/"}	2026-05-17 18:38:54.909916+07
38	page_view	sport	{"path": "/"}	2026-05-17 18:51:45.346397+07
39	page_view	sport	{"path": "/"}	2026-05-17 19:08:10.389195+07
40	page_view	sport	{"path": "/"}	2026-05-17 19:10:44.301042+07
41	page_view	wedding	{"path": "/"}	2026-05-17 19:10:53.293668+07
42	page_view	wedding	{"path": "/"}	2026-05-18 00:18:32.714417+07
43	page_view	sport	{"path": "/"}	2026-05-18 00:18:36.25872+07
44	page_view	portrait	{"path": "/"}	2026-05-18 00:18:59.026739+07
45	page_view	portrait	{"path": "/"}	2026-05-18 00:24:26.166177+07
46	page_view	portrait	{"path": "/"}	2026-05-18 00:29:02.671502+07
47	page_view	portrait	{"path": "/"}	2026-05-18 00:30:01.284186+07
48	page_view	sport	{"path": "/"}	2026-05-18 00:30:04.329004+07
49	page_view	portrait	{"path": "/"}	2026-05-18 00:30:13.739975+07
50	page_view	portrait	{"path": "/"}	2026-05-18 00:33:47.493755+07
51	page_view	portrait	{"path": "/"}	2026-05-18 00:35:53.233726+07
52	page_view	portrait	{"path": "/"}	2026-05-18 00:38:04.915738+07
53	page_view	portrait	{"path": "/"}	2026-05-18 00:40:34.515327+07
54	page_view	sport	{"path": "/"}	2026-05-18 00:40:37.496952+07
55	page_view	sport	{"path": "/"}	2026-05-18 00:43:12.915134+07
56	page_view	sport	{"path": "/"}	2026-05-18 00:45:32.468756+07
57	page_view	sport	{"path": "/"}	2026-05-18 00:48:01.876429+07
58	page_view	portrait	{"path": "/"}	2026-05-18 00:49:33.106727+07
59	page_view	portrait	{"path": "/"}	2026-05-18 00:56:46.745364+07
60	view_event	portrait	{"id": 14, "title": "Kompilasi Prewedding"}	2026-05-18 00:57:09.784896+07
61	view_event	portrait	{"id": 15, "title": "test contoh"}	2026-05-18 00:57:14.838252+07
62	page_view	portrait	{"path": "/"}	2026-05-18 00:58:52.329956+07
63	view_event	portrait	{"id": 15, "title": "test contoh"}	2026-05-18 00:58:54.14351+07
64	page_view	portrait	{"path": "/"}	2026-05-18 00:59:02.034476+07
65	view_event	portrait	{"id": 15, "title": "test contoh"}	2026-05-18 00:59:02.52946+07
66	page_view	portrait	{"path": "/"}	2026-05-18 09:02:05.623998+07
67	page_view	portrait	{"path": "/"}	2026-05-18 09:43:03.073704+07
68	view_event	portrait	{"id": 9, "title": "Wedding Ifani & Okky, 31 Mei 2025"}	2026-05-18 09:43:10.069498+07
69	page_view	portrait	{"path": "/"}	2026-05-18 10:03:39.872171+07
70	page_view	portrait	{"path": "/"}	2026-05-18 10:09:14.886276+07
71	page_view	portrait	{"path": "/"}	2026-05-18 10:10:18.879925+07
72	page_view	portrait	{"path": "/"}	2026-05-18 10:18:28.256422+07
73	page_view	portrait	{"path": "/"}	2026-05-18 10:22:22.178859+07
74	page_view	portrait	{"path": "/"}	2026-05-18 10:22:49.366841+07
75	page_view	portrait	{"path": "/"}	2026-05-18 10:24:20.83508+07
76	page_view	portrait	{"path": "/"}	2026-05-18 10:24:26.527242+07
77	page_view	portrait	{"path": "/"}	2026-05-18 10:26:27.771813+07
78	page_view	portrait	{"path": "/"}	2026-05-18 10:27:23.461312+07
79	page_view	portrait	{"path": "/"}	2026-05-18 10:30:27.973891+07
80	page_view	sport	{"path": "/"}	2026-05-18 10:30:33.321159+07
81	page_view	sport	{"path": "/"}	2026-05-18 10:32:27.890269+07
82	page_view	sport	{"path": "/"}	2026-05-18 10:36:51.052923+07
83	page_view	portrait	{"path": "/"}	2026-05-18 10:36:53.838652+07
84	view_event	portrait	{"id": 5, "title": "Kompilasi Galeri Wedding"}	2026-05-18 10:37:08.132635+07
85	page_view	portrait	{"path": "/"}	2026-05-18 10:38:58.876934+07
86	page_view	portrait	{"path": "/"}	2026-05-18 10:43:07.205462+07
87	view_event	portrait	{"id": 6, "title": "Resepsi Heri&Dini, 25 Agustus 2024"}	2026-05-18 10:45:02.068803+07
88	page_view	portrait	{"path": "/"}	2026-05-18 10:50:28.17255+07
89	page_view	portrait	{"path": "/"}	2026-05-20 10:16:55.892896+07
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, client_name, event, event_date, message, created_at, status, location, theme_ref, instagram) FROM stdin;
2	jjjj	Prewedd	2026-05-17 18:02:08.379+07		2026-05-17 18:02:23.002544+07	pending	\N	\N	\N
1	adwadaw	Prewedd	2026-05-17 17:56:32.697+07	jknakdnawmdkawdmkawd	2026-05-17 17:57:24.876581+07	pending	\N	\N	\N
3	aaa	Prewedd	2026-05-18 00:29:59.222+07		2026-05-18 00:31:02.098366+07	pending	aaa	aaaaa	aaaa
4	adwawad	Prewedd	2026-05-18 00:29:59.222+07	awdawdwaadadwawdawdawd	2026-05-18 00:32:31.99621+07	pending	adawdwd	awdaw	awdaw
5	awdwa	Prewedd	2026-05-18 00:35:51.188+07	awdawdawdawdawd	2026-05-18 00:36:00.917701+07	pending	awdawddawadwad	awdaddaw	awdaw
6	aaww	Prewedd	2026-05-18 00:38:02.86+07	awdwaawdawdawdawd	2026-05-18 00:38:11.535368+07	pending	awdawddawadwad	awdaddaw	awdaw
7	aaww	Contoh Buat Sport	2026-05-18 00:40:32.473+07	adawddaw	2026-05-18 00:40:45.436837+07	pending	awdawddawadwad	awdaddaw	awdaw
8	aaww	Contoh Buat Sport	2026-05-18 00:45:30.385+07		2026-05-18 00:45:37.803078+07	pending	awdawddawadwad	awdaddaw	awdaw
9	aaww	Contoh Buat Sport	2026-05-18 00:45:30.385+07		2026-05-18 00:45:57.08046+07	pending	awdawddawadwad	awdaddaw	awdaw
10	aaww	Contoh Buat Sport	2026-05-18 00:45:30.385+07		2026-05-18 00:46:09.282322+07	pending	awdawddawadwad	awdaddaw	awdaw
11	aaww	Contoh Buat Sport	2026-05-18 00:47:59.813+07		2026-05-18 00:48:07.980681+07	pending	awdawddawadwad	awdaddaw	awdaw
\.


--
-- Data for Name: event_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_images (id, event_id, url, is_cover, created_at) FROM stdin;
1	1	assets/media/sport_DSC_5282.jpg	t	2026-05-16 23:30:53.31364+07
2	1	assets/media/sport_DSC_5283.jpg	f	2026-05-16 23:30:53.31364+07
3	1	assets/media/sport_DSC_5287.jpg	f	2026-05-16 23:30:53.31364+07
4	1	assets/media/sport_DSC_5290.jpg	f	2026-05-16 23:30:53.31364+07
5	1	assets/media/sport_DSC_5292.jpg	f	2026-05-16 23:30:53.31364+07
6	1	assets/media/sport_DSC_5294.jpg	f	2026-05-16 23:30:53.31364+07
7	1	assets/media/sport_DSC_5304.jpg	f	2026-05-16 23:30:53.31364+07
8	1	assets/media/sport_DSC_5307.jpg	f	2026-05-16 23:30:53.31364+07
9	1	assets/media/sport_DSC_5314.jpg	f	2026-05-16 23:30:53.31364+07
10	1	assets/media/sport_DSC_5316.jpg	f	2026-05-16 23:30:53.31364+07
11	1	assets/media/sport_DSC_5317.jpg	f	2026-05-16 23:30:53.31364+07
12	1	assets/media/sport_DSC_5319.jpg	f	2026-05-16 23:30:53.31364+07
13	1	assets/media/sport_DSC_5320.jpg	f	2026-05-16 23:30:53.31364+07
14	1	assets/media/sport_DSC_5321.jpg	f	2026-05-16 23:30:53.31364+07
15	1	assets/media/sport_DSC_5322.jpg	f	2026-05-16 23:30:53.31364+07
16	1	assets/media/sport_DSC_5323.jpg	f	2026-05-16 23:30:53.31364+07
17	1	assets/media/sport_DSC_5325.jpg	f	2026-05-16 23:30:53.31364+07
18	1	assets/media/sport_DSC_5332.jpg	f	2026-05-16 23:30:53.31364+07
19	1	assets/media/sport_DSC_5333.jpg	f	2026-05-16 23:30:53.31364+07
20	1	assets/media/sport_DSC_5336.jpg	f	2026-05-16 23:30:53.31364+07
21	1	assets/media/sport_DSC_5338.jpg	f	2026-05-16 23:30:53.31364+07
22	1	assets/media/sport_DSC_5339.jpg	f	2026-05-16 23:30:53.31364+07
23	1	assets/media/sport_DSC_5341.jpg	f	2026-05-16 23:30:53.31364+07
24	1	assets/media/sport_DSC_5357.jpg	f	2026-05-16 23:30:53.31364+07
25	1	assets/media/sport_DSC_5361.jpg	f	2026-05-16 23:30:53.31364+07
26	1	assets/media/sport_DSC_5291.jpg	f	2026-05-16 23:30:53.31364+07
27	1	assets/media/sport_DSC_5296.jpg	f	2026-05-16 23:30:53.31364+07
28	1	assets/media/sport_DSC_5298.jpg	f	2026-05-16 23:30:53.31364+07
29	1	assets/media/sport_DSC_5300.jpg	f	2026-05-16 23:30:53.31364+07
30	1	assets/media/sport_DSC_5302.jpg	f	2026-05-16 23:30:53.31364+07
31	1	assets/media/sport_DSC_5318.jpg	f	2026-05-16 23:30:53.31364+07
32	1	assets/media/sport_DSC_5329.jpg	f	2026-05-16 23:30:53.31364+07
33	1	assets/media/sport_DSC_5334.jpg	f	2026-05-16 23:30:53.31364+07
34	1	assets/media/sport_DSC_5340.jpg	f	2026-05-16 23:30:53.31364+07
35	1	assets/media/sport_DSC_5362.jpg	f	2026-05-16 23:30:53.31364+07
36	2	assets/media/sport_AUG 2024.mp4	t	2026-05-16 23:30:53.31364+07
37	2	assets/media/sport_MRF_9269.jpg	f	2026-05-16 23:30:53.31364+07
38	2	assets/media/sport_MRF_9286.jpg	f	2026-05-16 23:30:53.31364+07
39	2	assets/media/sport_MRF_9309.jpg	f	2026-05-16 23:30:53.31364+07
40	2	assets/media/sport_MRF_9325.jpg	f	2026-05-16 23:30:53.31364+07
41	2	assets/media/sport_MRF_9476.jpg	f	2026-05-16 23:30:53.31364+07
42	2	assets/media/sport_MRF_9521-2.jpg	f	2026-05-16 23:30:53.31364+07
43	2	assets/media/sport_MRF_9531.jpg	f	2026-05-16 23:30:53.31364+07
44	2	assets/media/sport_MRF_9558.jpg	f	2026-05-16 23:30:53.31364+07
45	2	assets/media/sport_MRF_9597.jpg	f	2026-05-16 23:30:53.31364+07
46	2	assets/media/sport_MRF_9607.jpg	f	2026-05-16 23:30:53.31364+07
47	2	assets/media/sport_MRF_9644.jpg	f	2026-05-16 23:30:53.31364+07
48	2	assets/media/sport_MRF_9685.jpg	f	2026-05-16 23:30:53.31364+07
49	2	assets/media/sport_MRF_9687.jpg	f	2026-05-16 23:30:53.31364+07
50	2	assets/media/sport_MRF_9729.jpg	f	2026-05-16 23:30:53.31364+07
51	2	assets/media/sport_MRF_9759.jpg	f	2026-05-16 23:30:53.31364+07
52	2	assets/media/sport_MRF_9781.jpg	f	2026-05-16 23:30:53.31364+07
53	2	assets/media/sport_MRF_9792.jpg	f	2026-05-16 23:30:53.31364+07
54	2	assets/media/sport_MRF_9206.jpg	f	2026-05-16 23:30:53.31364+07
55	2	assets/media/sport_MRF_9251.jpg	f	2026-05-16 23:30:53.31364+07
56	2	assets/media/sport_MRF_9254.jpg	f	2026-05-16 23:30:53.31364+07
57	2	assets/media/sport_MRF_9310.jpg	f	2026-05-16 23:30:53.31364+07
58	3	assets/media/sport_Reunion and Paintball at Obelix Village.mp4	t	2026-05-16 23:30:53.31364+07
59	3	assets/media/sport_MRF_8738.jpg	f	2026-05-16 23:30:53.31364+07
60	3	assets/media/sport_MRF_8745.jpg	f	2026-05-16 23:30:53.31364+07
61	3	assets/media/sport_MRF_8746.jpg	f	2026-05-16 23:30:53.31364+07
62	3	assets/media/sport_MRF_8753.jpg	f	2026-05-16 23:30:53.31364+07
63	3	assets/media/sport_MRF_8754.jpg	f	2026-05-16 23:30:53.31364+07
64	3	assets/media/sport_MRF_8759.jpg	f	2026-05-16 23:30:53.31364+07
65	3	assets/media/sport_MRF_8768.jpg	f	2026-05-16 23:30:53.31364+07
66	3	assets/media/sport_MRF_8769.jpg	f	2026-05-16 23:30:53.31364+07
67	3	assets/media/sport_MRF_8770.jpg	f	2026-05-16 23:30:53.31364+07
68	3	assets/media/sport_MRF_8771.jpg	f	2026-05-16 23:30:53.31364+07
69	3	assets/media/sport_MRF_8774.jpg	f	2026-05-16 23:30:53.31364+07
70	3	assets/media/sport_MRF_8776.jpg	f	2026-05-16 23:30:53.31364+07
71	3	assets/media/sport_MRF_8781.jpg	f	2026-05-16 23:30:53.31364+07
72	3	assets/media/sport_MRF_8794.jpg	f	2026-05-16 23:30:53.31364+07
73	3	assets/media/sport_MRF_8799.jpg	f	2026-05-16 23:30:53.31364+07
74	3	assets/media/sport_MRF_8831.jpg	f	2026-05-16 23:30:53.31364+07
75	3	assets/media/sport_MRF_8832.jpg	f	2026-05-16 23:30:53.31364+07
76	3	assets/media/sport_MRF_8833.jpg	f	2026-05-16 23:30:53.31364+07
77	3	assets/media/sport_MRF_8898.jpg	f	2026-05-16 23:30:53.31364+07
78	3	assets/media/sport_MRF_8737.jpg	f	2026-05-16 23:30:53.31364+07
79	3	assets/media/sport_MRF_8760.jpg	f	2026-05-16 23:30:53.31364+07
80	3	assets/media/sport_MRF_8766.jpg	f	2026-05-16 23:30:53.31364+07
81	3	assets/media/sport_MRF_8788.jpg	f	2026-05-16 23:30:53.31364+07
82	3	assets/media/sport_MRF_8893.jpg	f	2026-05-16 23:30:53.31364+07
83	3	assets/media/sport_MRF_8900.jpg	f	2026-05-16 23:30:53.31364+07
84	4	assets/media/sport_DSC_6726.jpg	t	2026-05-16 23:30:53.31364+07
85	4	assets/media/sport_DSC_6796.jpg	f	2026-05-16 23:30:53.31364+07
86	4	assets/media/sport_DSC_6859.jpg	f	2026-05-16 23:30:53.31364+07
87	4	assets/media/sport_DSC_6946.jpg	f	2026-05-16 23:30:53.31364+07
88	4	assets/media/sport_DSC_6947.jpg	f	2026-05-16 23:30:53.31364+07
89	4	assets/media/sport_DSC_6965.jpg	f	2026-05-16 23:30:53.31364+07
90	4	assets/media/sport_DSC_6967.jpg	f	2026-05-16 23:30:53.31364+07
91	4	assets/media/sport_DSC_6971.jpg	f	2026-05-16 23:30:53.31364+07
92	4	assets/media/sport_DSC_6982.jpg	f	2026-05-16 23:30:53.31364+07
93	4	assets/media/sport_DSC_6984.jpg	f	2026-05-16 23:30:53.31364+07
94	4	assets/media/sport_DSC_6985.jpg	f	2026-05-16 23:30:53.31364+07
95	4	assets/media/sport_DSC_6989.jpg	f	2026-05-16 23:30:53.31364+07
96	4	assets/media/sport_DSC_6991.jpg	f	2026-05-16 23:30:53.31364+07
97	4	assets/media/sport_DSC_6993.jpg	f	2026-05-16 23:30:53.31364+07
98	4	assets/media/sport_DSC_6994.jpg	f	2026-05-16 23:30:53.31364+07
99	4	assets/media/sport_DSC_7204.jpg	f	2026-05-16 23:30:53.31364+07
100	4	assets/media/sport_DSC_7215.jpg	f	2026-05-16 23:30:53.31364+07
101	4	assets/media/sport_DSC_7221.jpg	f	2026-05-16 23:30:53.31364+07
102	4	assets/media/sport_DSC_7225.jpg	f	2026-05-16 23:30:53.31364+07
103	4	assets/media/sport_DSC_7226.jpg	f	2026-05-16 23:30:53.31364+07
104	4	assets/media/sport_DSC_7230.jpg	f	2026-05-16 23:30:53.31364+07
105	4	assets/media/sport_DSC_7267.jpg	f	2026-05-16 23:30:53.31364+07
106	4	assets/media/sport_DSC_7272.jpg	f	2026-05-16 23:30:53.31364+07
107	4	assets/media/sport_DSC_7358.jpg	f	2026-05-16 23:30:53.31364+07
108	4	assets/media/sport_DSC_7384.jpg	f	2026-05-16 23:30:53.31364+07
109	4	assets/media/sport_DSC_7479.jpg	f	2026-05-16 23:30:53.31364+07
110	4	assets/media/sport_DSC_7487.jpg	f	2026-05-16 23:30:53.31364+07
111	4	assets/media/sport_DSC_7527.jpg	f	2026-05-16 23:30:53.31364+07
112	4	assets/media/sport_DSC_7536.jpg	f	2026-05-16 23:30:53.31364+07
113	5	assets/media/wedding_APK00154.jpg	t	2026-05-16 23:30:53.31364+07
114	5	assets/media/wedding_APK00319.jpg	f	2026-05-16 23:30:53.31364+07
115	5	assets/media/wedding_APK01483.jpg	f	2026-05-16 23:30:53.31364+07
116	5	assets/media/wedding_MRF_2632.jpg	f	2026-05-16 23:30:53.31364+07
117	5	assets/media/wedding_APK00149.jpg	f	2026-05-16 23:30:53.31364+07
118	5	assets/media/wedding_APK00209.jpg	f	2026-05-16 23:30:53.31364+07
119	5	assets/media/wedding_APK00333.jpg	f	2026-05-16 23:30:53.31364+07
120	5	assets/media/wedding_APK00341.jpg	f	2026-05-16 23:30:53.31364+07
121	5	assets/media/wedding_APK00392.jpg	f	2026-05-16 23:30:53.31364+07
122	5	assets/media/wedding_APK00480.jpg	f	2026-05-16 23:30:53.31364+07
123	5	assets/media/wedding_APK00790.jpg	f	2026-05-16 23:30:53.31364+07
124	5	assets/media/wedding_APK00826.jpg	f	2026-05-16 23:30:53.31364+07
125	5	assets/media/wedding_APK00877.jpg	f	2026-05-16 23:30:53.31364+07
126	5	assets/media/wedding_APK00936.jpg	f	2026-05-16 23:30:53.31364+07
127	5	assets/media/wedding_APK00977.jpg	f	2026-05-16 23:30:53.31364+07
128	5	assets/media/wedding_APK01040.jpg	f	2026-05-16 23:30:53.31364+07
129	5	assets/media/wedding_APK01084.jpg	f	2026-05-16 23:30:53.31364+07
130	5	assets/media/wedding_APK01274.jpg	f	2026-05-16 23:30:53.31364+07
131	5	assets/media/wedding_APK01376.jpg	f	2026-05-16 23:30:53.31364+07
132	5	assets/media/wedding_APK01475.jpg	f	2026-05-16 23:30:53.31364+07
133	5	assets/media/wedding_DCK09191.jpg	f	2026-05-16 23:30:53.31364+07
134	5	assets/media/wedding_MRF_2575.jpg	f	2026-05-16 23:30:53.31364+07
135	5	assets/media/wedding_MRF_2577.jpg	f	2026-05-16 23:30:53.31364+07
136	5	assets/media/wedding_MRF_2582.jpg	f	2026-05-16 23:30:53.31364+07
137	5	assets/media/wedding_MRF_2586.jpg	f	2026-05-16 23:30:53.31364+07
138	5	assets/media/wedding_MRF_2591.jpg	f	2026-05-16 23:30:53.31364+07
139	5	assets/media/wedding_MRF_2599.jpg	f	2026-05-16 23:30:53.31364+07
140	5	assets/media/wedding_MRF_2606.jpg	f	2026-05-16 23:30:53.31364+07
141	5	assets/media/wedding_MRF_2610.jpg	f	2026-05-16 23:30:53.31364+07
142	5	assets/media/wedding_MRF_2611.jpg	f	2026-05-16 23:30:53.31364+07
143	5	assets/media/wedding_MRF_2652.jpg	f	2026-05-16 23:30:53.31364+07
144	5	assets/media/wedding_MRF_2674.jpg	f	2026-05-16 23:30:53.31364+07
145	5	assets/media/wedding_MRF_2705.jpg	f	2026-05-16 23:30:53.31364+07
146	5	assets/media/wedding_MRF_2714.jpg	f	2026-05-16 23:30:53.31364+07
147	5	assets/media/wedding_MRF_2736.jpg	f	2026-05-16 23:30:53.31364+07
148	5	assets/media/wedding_MRF_2738.jpg	f	2026-05-16 23:30:53.31364+07
149	5	assets/media/wedding_MRF_2744.jpg	f	2026-05-16 23:30:53.31364+07
150	6	assets/media/video_(16-9)_Resepsi Heri&Dini, 25 Agustus 2024.mp4	t	2026-05-16 23:30:53.31364+07
151	6	assets/media/video_(2.35-1)_Resepsi Heri&Dini, 25 Agustus 2024.mp4	f	2026-05-16 23:30:53.31364+07
152	7	assets/media/video_(final 1 minutes)_Wedding Aeni & Arif, 7 September 2024.mp4	t	2026-05-16 23:30:53.31364+07
153	8	assets/media/video_Anindita Galvin.mp4	t	2026-05-16 23:30:53.31364+07
154	9	assets/media/video_Highlight_Wedding Ifani & Okky, 31 Mei 2025.mp4	t	2026-05-16 23:30:53.31364+07
155	10	assets/media/video_Lamaran Ferry, 11 Juni 2024.mp4	t	2026-05-16 23:30:53.31364+07
156	11	assets/media/video_PREWED MASJID KOTA GEDE.mp4	t	2026-05-16 23:30:53.31364+07
157	12	assets/media/video_The Wedding Ulfi & Hidayat ( 1 Minute Version ).mp4	t	2026-05-16 23:30:53.31364+07
158	13	assets/media/video_The Wedding Ulfi & Hidayat ( 3 Minute Version ).mp4	t	2026-05-16 23:30:53.31364+07
159	14	assets/media/wedding_DMH05569.jpg	t	2026-05-16 23:30:53.31364+07
160	14	assets/media/wedding_DMH05580.jpg	f	2026-05-16 23:30:53.31364+07
161	14	assets/media/wedding_DMH05584.jpg	f	2026-05-16 23:30:53.31364+07
162	14	assets/media/wedding_DMH05586.jpg	f	2026-05-16 23:30:53.31364+07
163	14	assets/media/wedding_DMH05627.jpg	f	2026-05-16 23:30:53.31364+07
164	14	assets/media/wedding_DMH05628.jpg	f	2026-05-16 23:30:53.31364+07
165	14	assets/media/wedding_DSC07437.jpg	f	2026-05-16 23:30:53.31364+07
166	14	assets/media/wedding_DSC07439.jpg	f	2026-05-16 23:30:53.31364+07
167	14	assets/media/wedding_DSC07447.jpg	f	2026-05-16 23:30:53.31364+07
168	14	assets/media/wedding_DSC07476.jpg	f	2026-05-16 23:30:53.31364+07
169	14	assets/media/wedding_DSC07496.jpg	f	2026-05-16 23:30:53.31364+07
170	14	assets/media/wedding_DSC07502.jpg	f	2026-05-16 23:30:53.31364+07
171	14	assets/media/wedding_DSC07526.jpg	f	2026-05-16 23:30:53.31364+07
172	14	assets/media/wedding_DSC07539.jpg	f	2026-05-16 23:30:53.31364+07
173	14	assets/media/wedding_MRF_6650.jpg	f	2026-05-16 23:30:53.31364+07
174	14	assets/media/wedding_MRF_6651.jpg	f	2026-05-16 23:30:53.31364+07
175	14	assets/media/wedding_MRF_6656.jpg	f	2026-05-16 23:30:53.31364+07
176	14	assets/media/wedding_MRF_6693.jpg	f	2026-05-16 23:30:53.31364+07
177	14	assets/media/wedding_MRF_6711.jpg	f	2026-05-16 23:30:53.31364+07
178	14	assets/media/wedding_SFA04252.jpg	f	2026-05-16 23:30:53.31364+07
179	14	assets/media/wedding_SFA04253.jpg	f	2026-05-16 23:30:53.31364+07
180	14	assets/media/wedding_SFA04262.jpg	f	2026-05-16 23:30:53.31364+07
181	14	assets/media/wedding_SFA04268.jpg	f	2026-05-16 23:30:53.31364+07
182	14	assets/media/wedding_SFA04272.jpg	f	2026-05-16 23:30:53.31364+07
183	14	assets/media/wedding_SFA04275.jpg	f	2026-05-16 23:30:53.31364+07
184	14	assets/media/wedding_SFA04277.jpg	f	2026-05-16 23:30:53.31364+07
185	14	assets/media/wedding_SFA04283.jpg	f	2026-05-16 23:30:53.31364+07
186	14	assets/media/wedding_SFA04285.jpg	f	2026-05-16 23:30:53.31364+07
187	14	assets/media/wedding_SFA04344.jpg	f	2026-05-16 23:30:53.31364+07
188	14	assets/media/wedding_SFA04360.jpg	f	2026-05-16 23:30:53.31364+07
189	14	assets/media/wedding_SFA04368.jpg	f	2026-05-16 23:30:53.31364+07
190	14	assets/media/wedding_SFA04376.jpg	f	2026-05-16 23:30:53.31364+07
191	14	assets/media/wedding_SFA04380.jpg	f	2026-05-16 23:30:53.31364+07
192	14	assets/media/wedding_SFA04386.jpg	f	2026-05-16 23:30:53.31364+07
193	14	assets/media/wedding_SFA04389.jpg	f	2026-05-16 23:30:53.31364+07
194	14	assets/media/wedding_SFA04398.jpg	f	2026-05-16 23:30:53.31364+07
195	14	assets/media/wedding_SFA04407.jpg	f	2026-05-16 23:30:53.31364+07
196	14	assets/media/wedding_SFA04423.jpg	f	2026-05-16 23:30:53.31364+07
197	14	assets/media/wedding_SFA04430.jpg	f	2026-05-16 23:30:53.31364+07
399	15	assets/media/upload_1779040699712_6qqcln.webp	t	2026-05-18 00:58:44.045093+07
400	15	assets/media/upload_1779040705847_pzyoag.webp	f	2026-05-18 00:58:44.051252+07
401	15	assets/media/upload_1779040708979_mu8qel.webp	f	2026-05-18 00:58:44.051982+07
402	15	assets/media/upload_1779040711232_t1rb2e.webp	f	2026-05-18 00:58:44.052626+07
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, title, theme, created_at, category) FROM stdin;
1	Fun Football	sport	2026-05-16 23:30:53.31364+07	\N
2	Karate	sport	2026-05-16 23:30:53.31364+07	\N
3	Paintball	sport	2026-05-16 23:30:53.31364+07	\N
4	Pacuan Kuda	sport	2026-05-16 23:30:53.31364+07	\N
5	Kompilasi Galeri Wedding	portrait	2026-05-16 23:30:53.31364+07	wedding
14	Kompilasi Prewedding	portrait	2026-05-16 23:30:53.31364+07	prewed
8	Anindita Galvin	portrait	2026-05-16 23:30:53.31364+07	wedding
10	Lamaran Ferry, 11 Juni 2024	portrait	2026-05-16 23:30:53.31364+07	engagement
11	PREWED MASJID KOTA GEDE	portrait	2026-05-16 23:30:53.31364+07	prewed
6	Resepsi Heri&Dini, 25 Agustus 2024	portrait	2026-05-16 23:30:53.31364+07	wedding
12	The Wedding Ulfi & Hidayat ( 1 Minute Version )	portrait	2026-05-16 23:30:53.31364+07	wedding
13	The Wedding Ulfi & Hidayat ( 3 Minute Version )	portrait	2026-05-16 23:30:53.31364+07	wedding
7	Wedding Aeni & Arif, 7 September 2024	portrait	2026-05-16 23:30:53.31364+07	wedding
9	Wedding Ifani & Okky, 31 Mei 2025	portrait	2026-05-16 23:30:53.31364+07	wedding
15	test contoh	portrait	2026-05-17 13:36:57.412386+07	family
\.


--
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.packages (id, theme, name, tag, features, is_popular, created_at) FROM stdin;
1	portrait	Prewedd	DISCOUNT 30%	["poto", "busana"]	t	2026-05-17 15:04:05.863863+07
2	sport	Contoh Buat Sport	New Service	["hahah", "hehehe", "yuahdawkdaw", "awkudahwdawd", "adgggggagdhjw"]	f	2026-05-18 00:29:52.40485+07
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, setting_key, setting_value, created_at, updated_at) FROM stdin;
1	whatsapp_number	6281299880030	2026-05-17 15:44:04.746513+07	2026-05-18 00:56:39.405135+07
3	instagram_username	falgunipicture	2026-05-18 00:52:38.485346+07	2026-05-18 00:56:39.411163+07
6	portrait_spotlight	wedding	2026-05-18 10:03:09.86674+07	2026-05-18 10:24:37.664288+07
7	hero_image_sport	assets/media/upload_1779074479248_jx1a3k.webp	2026-05-18 10:03:09.875919+07	2026-05-18 10:24:37.667562+07
12	about_image_sport		2026-05-18 10:03:09.881049+07	2026-05-18 10:24:37.668258+07
8	hero_image_wisuda	assets/media/upload_1779074533647_3xmsqk.webp	2026-05-18 10:03:09.87728+07	2026-05-18 10:24:37.668863+07
13	about_image_wisuda		2026-05-18 10:03:09.882178+07	2026-05-18 10:24:37.66941+07
9	hero_image_wedding	assets/media/upload_1779074650217_z541b.webp	2026-05-18 10:03:09.878237+07	2026-05-18 10:24:37.670274+07
14	about_image_wedding		2026-05-18 10:03:09.883011+07	2026-05-18 10:24:37.670941+07
10	hero_image_prewed		2026-05-18 10:03:09.879209+07	2026-05-18 10:24:37.671553+07
15	about_image_prewed		2026-05-18 10:03:09.884087+07	2026-05-18 10:24:37.672255+07
11	hero_image_family		2026-05-18 10:03:09.880271+07	2026-05-18 10:24:37.672942+07
16	about_image_family		2026-05-18 10:03:09.885176+07	2026-05-18 10:24:37.67437+07
50	hero_image_engagement		2026-05-18 10:38:41.335402+07	2026-05-18 10:38:41.335402+07
51	about_image_engagement		2026-05-18 10:38:41.351147+07	2026-05-18 10:38:41.351147+07
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.testimonials (id, client_name, role, review, rating, created_at) FROM stdin;
\.


--
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 1, true);


--
-- Name: analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.analytics_id_seq', 89, true);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bookings_id_seq', 11, true);


--
-- Name: event_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_images_id_seq', 402, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 29, true);


--
-- Name: packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.packages_id_seq', 2, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 51, true);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 1, false);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_key UNIQUE (username);


--
-- Name: analytics analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: event_images event_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_images
    ADD CONSTRAINT event_images_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events events_title_theme_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_title_theme_unique UNIQUE (title, theme);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: event_images event_images_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_images
    ADD CONSTRAINT event_images_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

