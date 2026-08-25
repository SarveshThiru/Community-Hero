-- Community Hero Database Schema
-- Migration: 001_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom types
CREATE TYPE user_role AS ENUM ('citizen', 'authority', 'admin');
CREATE TYPE issue_status AS ENUM ('reported', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected');
CREATE TYPE issue_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE vote_type AS ENUM ('up', 'down');
CREATE TYPE notification_type AS ENUM ('status_change', 'comment', 'upvote', 'assignment', 'verification', 'resolution');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'citizen',
    department TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Issues table
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    severity issue_severity NOT NULL DEFAULT 'medium',
    status issue_status NOT NULL DEFAULT 'reported',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    department TEXT,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Issue updates table (status change history)
CREATE TABLE issue_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    previous_status issue_status,
    new_status issue_status NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(issue_id, user_id)
);

-- Follows table
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(issue_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_issues_reporter_id ON issues(reporter_id);
CREATE INDEX idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_severity ON issues(severity);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX idx_issues_location ON issues USING GIST (
    (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography)
);

CREATE INDEX idx_comments_issue_id ON comments(issue_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_issue_updates_issue_id ON issue_updates(issue_id);
CREATE INDEX idx_votes_issue_id ON votes(issue_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_follows_issue_id ON follows(issue_id);
CREATE INDEX idx_follows_user_id ON follows(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Issues policies
CREATE POLICY "Issues are viewable by everyone" ON issues
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create issues" ON issues
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters can update their own issues" ON issues
    FOR UPDATE USING (auth.uid() = reporter_id);

CREATE POLICY "Authorities can update any issue" ON issues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('authority', 'admin')
        )
    );

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Issue updates policies
CREATE POLICY "Issue updates are viewable by everyone" ON issue_updates
    FOR SELECT USING (true);

CREATE POLICY "Authorities can create issue updates" ON issue_updates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('authority', 'admin')
        )
    );

-- Votes policies
CREATE POLICY "Votes are viewable by everyone" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON votes
    FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow" ON follows
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow" ON follows
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions for geospatial queries
CREATE OR REPLACE FUNCTION get_nearby_issues(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 5000,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    category TEXT,
    severity TEXT,
    status TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.title,
        i.category,
        i.severity::TEXT,
        i.status::TEXT,
        i.latitude,
        i.longitude,
        i.address,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) AS distance
    FROM issues i
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        radius_meters
    )
    ORDER BY distance
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION find_duplicate_issues(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    category_filter TEXT,
    radius_meters INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    category TEXT,
    status TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    distance DOUBLE PRECISION,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.title,
        i.category,
        i.status::TEXT,
        i.latitude,
        i.longitude,
        i.address,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) AS distance,
        i.created_at
    FROM issues i
    WHERE (category_filter = 'all' OR i.category = category_filter)
    AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        radius_meters
    )
    AND i.status != 'rejected'
    ORDER BY distance
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_issue_analytics(
    start_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL,
    department_filter TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'totalReports', COALESCE(total.count, 0),
        'pendingIssues', COALESCE(pending.count, 0),
        'resolvedIssues', COALESCE(resolved.count, 0),
        'criticalIssues', COALESCE(critical.count, 0),
        'categoryDistribution', COALESCE(cats.distribution, '[]'::jsonb),
        'statusDistribution', COALESCE(stats.distribution, '[]'::jsonb),
        'monthlyTrends', COALESCE(monthly.trends, '[]'::jsonb),
        'geographicHotspots', COALESCE(hotspots.spots, '[]'::jsonb),
        'resolutionRate', COALESCE(rate.rate, 0),
        'averageResolutionTime', COALESCE(avg_time.days, 0),
        'topCategories', COALESCE(top_cats.categories, '[]'::jsonb),
        'departmentPerformance', COALESCE(dept.performance, '[]'::jsonb)
    ) INTO result
    FROM (
        SELECT COUNT(*)::INTEGER AS count FROM issues
        WHERE (start_date IS NULL OR created_at >= start_date)
        AND (end_date IS NULL OR created_at <= end_date)
        AND (department_filter IS NULL OR department = department_filter)
    ) total
    CROSS JOIN (
        SELECT COUNT(*)::INTEGER AS count FROM issues
        WHERE status IN ('reported', 'verified', 'assigned', 'in_progress')
        AND (start_date IS NULL OR created_at >= start_date)
        AND (end_date IS NULL OR created_at <= end_date)
        AND (department_filter IS NULL OR department = department_filter)
    ) pending
    CROSS JOIN (
        SELECT COUNT(*)::INTEGER AS count FROM issues
        WHERE status = 'resolved'
        AND (start_date IS NULL OR created_at >= start_date)
        AND (end_date IS NULL OR created_at <= end_date)
        AND (department_filter IS NULL OR department = department_filter)
    ) resolved
    CROSS JOIN (
        SELECT COUNT(*)::INTEGER AS count FROM issues
        WHERE severity = 'critical'
        AND (start_date IS NULL OR created_at >= start_date)
        AND (end_date IS NULL OR created_at <= end_date)
        AND (department_filter IS NULL OR department = department_filter)
    ) critical
    CROSS JOIN LATERAL (
        SELECT jsonb_agg(jsonb_build_object(
            'category', category,
            'count', cnt,
            'percentage', ROUND(cnt::NUMERIC / NULLIF(total.count, 0) * 100, 1)
        ) ORDER BY cnt DESC) AS distribution
        FROM (
            SELECT category, COUNT(*)::INTEGER AS cnt
            FROM issues
            WHERE (start_date IS NULL OR created_at >= start_date)
            AND (end_date IS NULL OR created_at <= end_date)
            AND (department_filter IS NULL OR department = department_filter)
            GROUP BY category
        ) cat_counts
    ) cats
    CROSS JOIN LATERAL (
        SELECT jsonb_agg(jsonb_build_object(
            'status', status,
            'count', cnt,
            'percentage', ROUND(cnt::NUMERIC / NULLIF(total.count, 0) * 100, 1)
        ) ORDER BY cnt DESC) AS distribution
        FROM (
            SELECT status::TEXT, COUNT(*)::INTEGER AS cnt
            FROM issues
            WHERE (start_date IS NULL OR created_at >= start_date)
            AND (end_date IS NULL OR created_at <= end_date)
            AND (department_filter IS NULL OR department = department_filter)
            GROUP BY status
        ) status_counts
    ) stats
    CROSS JOIN LATERAL (
        SELECT jsonb_agg(jsonb_build_object(
            'month', to_char(month, 'Mon YYYY'),
            'reported', reported_cnt,
            'resolved', resolved_cnt,
            'pending', pending_cnt
        ) ORDER BY month) AS trends
        FROM (
            SELECT date_trunc('month', created_at) AS month,
                   COUNT(*) FILTER (WHERE status != 'rejected')::INTEGER AS reported_cnt,
                   COUNT(*) FILTER (WHERE status = 'resolved')::INTEGER AS resolved_cnt,
                   COUNT(*) FILTER (WHERE status IN ('reported', 'verified', 'assigned', 'in_progress'))::INTEGER AS pending_cnt
            FROM issues
            WHERE (start_date IS NULL OR created_at >= start_date)
            AND (end_date IS NULL OR created_at <= end_date)
            AND (department_filter IS NULL OR department = department_filter)
            GROUP BY date_trunc('month', created_at)
            ORDER BY month DESC
            LIMIT 12
        ) monthly_counts
    ) monthly
    CROSS JOIN LATERAL (
        SELECT jsonb_agg(jsonb_build_object(
            'latitude', latitude,
            'longitude', longitude,
            'count', cnt,
            'category', category
        ) ORDER BY cnt DESC) AS spots
        FROM (
            SELECT latitude, longitude, category, COUNT(*)::INTEGER AS cnt
            FROM issues
            WHERE (start_date IS NULL OR created_at >= start_date)
            AND (end_date IS NULL OR created_at <= end_date)
            AND (department_filter IS NULL OR department = department_filter)
            GROUP BY latitude, longitude, category
            HAVING COUNT(*) > 1
            ORDER BY cnt DESC
            LIMIT 10
        ) hotspot_counts
    ) hotspots
    CROSS JOIN LATERAL (
        SELECT CASE
            WHEN total.count > 0 THEN ROUND(resolved.count::NUMERIC / total.count * 100, 1)
            ELSE 0
        END AS rate
    ) rate
    CROSS JOIN LATERAL (
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400)::NUMERIC(10,1) AS days
        FROM issues
        WHERE status = 'resolved'
        AND resolved_at IS NOT NULL
        AND (start_date IS NULL OR created_at >= start_date)
        AND (end_date IS NULL OR created_at <= end_date)
        AND (department_filter IS NULL OR department = department_filter)
    ) avg_time
    CROSS JOIN LATERAL (
        SELECT jsonb_agg(jsonb_build_object(
            'category', category,
            'count', cnt,
            'percentage', ROUND(cnt::NUMERIC / NULLIF(total.count, 0) * 100, 1)
        ) ORDER BY cnt DESC) AS categories
        FROM (
            SELECT category, COUNT(*)::INTEGER AS cnt
            FROM issues
            WHERE (start_date IS NULL OR created_at >= start_date)
            AND (end_date IS NULL OR created_at <= end_date)
            AND (department_filter IS NULL OR department = department_filter)
            GROUP BY category
            ORDER BY cnt DESC
            LIMIT 5
        ) top_cat_counts
    ) top_cats
    CROSS JOIN LATERAL (
        SELECT jsonb_agg(jsonb_build_object(
            'department', dept,
            'resolved', resolved_cnt,
            'pending', pending_cnt,
            'avgTime', avg_days
        ) ORDER BY resolved_cnt DESC) AS performance
        FROM (
            SELECT
                COALESCE(department, 'Unassigned') AS dept,
                COUNT(*) FILTER (WHERE status = 'resolved')::INTEGER AS resolved_cnt,
                COUNT(*) FILTER (WHERE status IN ('reported', 'verified', 'assigned', 'in_progress'))::INTEGER AS pending_cnt,
                AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400)::NUMERIC(10,1) AS avg_days
            FROM issues
            WHERE (start_date IS NULL OR created_at >= start_date)
            AND (end_date IS NULL OR created_at <= end_date)
            AND (department_filter IS NULL OR department = department_filter)
            GROUP BY COALESCE(department, 'Unassigned')
        ) dept_counts
    ) dept;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for issues with detailed information
CREATE VIEW issue_with_details AS
SELECT
    i.*,
    p.full_name AS reporter_name,
    p.avatar_url AS reporter_avatar,
    a.full_name AS assignee_name,
    a.avatar_url AS assignee_avatar,
    (
        SELECT COUNT(*) FROM comments c WHERE c.issue_id = i.id
    ) AS comments_count,
    (
        SELECT EXISTS(
            SELECT 1 FROM votes v WHERE v.issue_id = i.id AND v.user_id = auth.uid()
        )
    ) AS user_voted,
    (
        SELECT v.vote_type FROM votes v WHERE v.issue_id = i.id AND v.user_id = auth.uid()
    ) AS user_vote,
    (
        SELECT EXISTS(
            SELECT 1 FROM follows f WHERE f.issue_id = i.id AND f.user_id = auth.uid()
        )
    ) AS is_following
FROM issues i
LEFT JOIN profiles p ON i.reporter_id = p.id
LEFT JOIN profiles a ON i.assignee_id = a.id;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')::user_role
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;