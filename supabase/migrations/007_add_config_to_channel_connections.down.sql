-- Reverse 007_add_config_to_channel_connections.sql

alter table channel_connections drop column if exists config;
