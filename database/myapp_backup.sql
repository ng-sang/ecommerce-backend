-- --
-- -- PostgreSQL database dump
-- --

-- \restrict FkWbHcwb7BswIfflRCWP4W1ApFJl8TcnjJW7biRj1MpzropdS1BA4TpGsW9EjVw

-- -- Dumped from database version 17.9 (Debian 17.9-1.pgdg13+1)
-- -- Dumped by pg_dump version 17.9 (Debian 17.9-1.pgdg13+1)

-- SET statement_timeout = 0;
-- SET lock_timeout = 0;
-- SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
-- SET client_encoding = 'UTF8';
-- SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
-- SET check_function_bodies = false;
-- SET xmloption = content;
-- SET client_min_messages = warning;
-- SET row_security = off;

-- --
-- -- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
-- --

-- CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


-- --
-- -- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: 
-- --

-- COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


-- --
-- -- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
-- --

-- CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


-- --
-- -- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
-- --

-- COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


-- SET default_tablespace = '';

-- SET default_table_access_method = heap;

-- --
-- -- Name: products; Type: TABLE; Schema: public; Owner: f8
-- --

-- CREATE TABLE public.products (
--     id integer NOT NULL
-- );


-- ALTER TABLE public.products OWNER TO f8;

-- --
-- -- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: f8
-- --

-- ALTER TABLE public.products ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
--     SEQUENCE NAME public.products_id_seq
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1
-- );


-- --
-- -- Name: users; Type: TABLE; Schema: public; Owner: f8
-- --

-- CREATE TABLE public.users (
--     id integer NOT NULL,
--     name character varying(30),
--     email character varying(100)
-- );


-- ALTER TABLE public.users OWNER TO f8;

-- --
-- -- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: f8
-- --

-- ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
--     SEQUENCE NAME public.users_id_seq
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1
-- );


-- --
-- -- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: f8
-- --

-- COPY public.products (id) FROM stdin;
-- \.


-- --
-- -- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: f8
-- --

-- COPY public.users (id, name, email) FROM stdin;
-- 1	Hoang An	hoangan.web@gmail.com
-- 2	Hoang An 2	hoangan.web2@gmail.com
-- \.


-- --
-- -- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: f8
-- --

-- SELECT pg_catalog.setval('public.products_id_seq', 1, false);


-- --
-- -- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: f8
-- --

-- SELECT pg_catalog.setval('public.users_id_seq', 2, true);


-- --
-- -- PostgreSQL database dump complete
-- --

-- \unrestrict FkWbHcwb7BswIfflRCWP4W1ApFJl8TcnjJW7biRj1MpzropdS1BA4TpGsW9EjVw

