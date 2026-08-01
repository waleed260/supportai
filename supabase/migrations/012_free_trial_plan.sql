-- Free trial plan for new organizations so the web widget works immediately
-- before a paid subscription is set up. New orgs get a 14-day trial on signup.

insert into subscription_plans (name, slug, description, price_monthly, price_yearly, max_conversations, max_seats, max_knowledge_docs, channels, features) values
('Free Trial', 'free_trial', '14-day free trial of AI customer support', 0, 0, 100, 1, 5, array['web_chat'], jsonb_build_object('lead_capture', true, 'sentiment_analysis', true, 'advanced_analytics', false, 'priority_support', false))
on conflict (slug) do nothing;
