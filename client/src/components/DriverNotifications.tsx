// client/src/components/DriverNotifications.tsx

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Users, DollarSign, Clock, Archive } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { DriverNotification } from "@/lib/types";


export default function DriverNotifications() {
  const [notifications, setNotifications] = useState<DriverNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"unread" | "all">("unread");

  useEffect(() => {
    loadNotifications();
    subscribeToNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const query = supabase
        .from("driver_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "unread") {
        query.eq("status", "unread");
      }

      const { data, error } = await query;
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const subscription = supabase
      .channel("driver_notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_notifications",
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("driver_notifications")
        .update({ status: "read", read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) throw error;
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const archiveNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("driver_notifications")
        .update({ status: "archived" })
        .eq("id", notificationId);

      if (error) throw error;
      loadNotifications();
    } catch (error) {
      console.error("Failed to archive:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Trip Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="default" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const tripDetails = notification.trip_details;
            const isUnread = notification.status === "unread";

            return (
              <Card
                key={notification.id}
                className={`p-4 transition-all ${isUnread ? "border-primary/50 bg-primary/5" : ""
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {isUnread && (
                      <div className="inline-block mb-2">
                        <Badge>New Trip</Badge>
                      </div>
                    )}

                    <h3 className="font-semibold mb-3 line-clamp-2">
                      {tripDetails.origin} → {tripDetails.destination}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {formatDate(tripDetails.departure_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span>{tripDetails.seats_needed} seats</span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4 flex-shrink-0" />
                        <span>Max ${tripDetails.max_price}</span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs">
                          {Math.floor(
                            (Date.now() -
                              new Date(notification.created_at).getTime()) /
                            (1000 * 60)
                          )}
                          m ago
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Traveler:</span>{" "}
                        {tripDetails.traveler_name} • {tripDetails.traveler_phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {isUnread && (
                      <Button
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="whitespace-nowrap"
                      >
                        View Trip
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => archiveNotification(notification.id)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            {filter === "unread"
              ? "No new trip notifications"
              : "No trip notifications yet"}
          </p>
        </Card>
      )}
    </div>
  );
}